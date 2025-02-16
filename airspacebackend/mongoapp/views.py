from django.http import JsonResponse
from .models import NFT

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ollama import chat
# from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
import subprocess
import json
from ollama import Client
from web3 import Web3
import requests
from datetime import datetime
import os
from dotenv import load_dotenv
import re

load_dotenv()
w3 = Web3(Web3.HTTPProvider(os.getenv('ETHEREUM_NODE_URL', 'https://eth-sepolia.g.alchemy.com/v2/l05qmoEsKgcOHBnYvDhWjJD8oRrrG0sw')))

# You'll need to get an API key from Etherscan
ETHERSCAN_API_KEY = os.getenv('F9BP7FJ5VZKBA6R62KX1NN97J55TSWRDH8')
OLLAMA_MODEL = "phi3:latest"  # Change to your preferred model (e.g., "llama3", "gemma")

def validate_ethereum_address(address):
    """Validate Ethereum address format"""
    return bool(re.match(r'^0x[a-fA-F0-9]{40}$', address))

def get_all_nfts(request):
    nfts = NFT.objects.all()  # Fetch all NFTs from MongoDB
    nfts_list = list(nfts.values())  # Convert queryset to list of dictionaries
    return JsonResponse(nfts_list, safe=False)
# import requests



def generate_legal_agreement(nft_token_id, nft_value, buyer_address, seller_address):
    """
    Calls the Ollama model to generate a legal agreement for the NFT transaction.
    """
    prompt = f"""
    Generate a legally binding agreement stating that the buyer ({buyer_address}) agrees to purchase the NFT ({nft_token_id}) 
    from the seller ({seller_address}) for {nft_value}. The agreement should be formal, legally sound, and include 
    terms of acceptance, ownership transfer, and responsibilities of both parties.
    """
    
    response = chat(
                model=OLLAMA_MODEL,
                messages=[{"role": "user", "content": prompt}]
            )
    return response['message']['content']
    
    
    # return "Error: Unable to generate agreement."

@api_view(['POST'])
def create_legal_agreement(request):
    """
    API to generate a legal agreement for an NFT transaction.
    """
    data = request.data
    required_fields = ["nft_token_id", "nft_value", "buyer_address", "seller_address"]
    
    # Validate input fields
    for field in required_fields:
        if field not in data:
            return Response({ "error": f"Missing field: {field}" }, status=status.HTTP_400_BAD_REQUEST)

    # Generate legal agreement using Ollama
    agreement_text = generate_legal_agreement(
        data["nft_token_id"],
        data["nft_value"],
        data["buyer_address"],
        data["seller_address"]
    )

    return Response({
        "message": "Legal agreement generated successfully",
        "agreement": agreement_text
    }, status=status.HTTP_200_OK)





@api_view(['POST'])
def analyze_deployment(request):
    try:
        # Extract parameters from request
        data = request.data
        buyer_address = data.get('buyer_address')
        seller_address = data.get('seller_address')
        contract_id = data.get('contract_id')
        tokens = data.get('tokens')

        # Validate inputs
        if not all([buyer_address, seller_address, contract_id, tokens]):
            return Response({
                'error': 'Missing required parameters'
            }, status=400)

        # Validate Ethereum addresses
        if not (validate_ethereum_address(buyer_address) and 
                validate_ethereum_address(seller_address)):
            return Response({
                'error': 'Invalid Ethereum address format'
            }, status=400)

        # Prepare prompt for the AI model
        prompt = f"""
        Analyze this NFT transaction and determine if the smart contract should be deployed.
        Respond with ONLY "EXECUTE" or "REJECT" based on these parameters:

        Buyer address: {buyer_address}
        Seller address: {seller_address}
        NFT Contract ID: {contract_id}
        NFT Tokens: {tokens}

        Rules:
        - Addresses must be valid Ethereum addresses
        - Contract ID should be a valid format
        - Token amounts should be reasonable
        - Buyer and seller addresses must be different
        """

        # Call Ollama with Phi-3 model
        response = chat(model=OLLAMA_MODEL, messages=[{
            'role': 'user',
            'content': prompt
        }])

        # Extract decision from model response
        decision = response['message']['content'].strip().upper()

        # Execute contract if model approves
        if decision:
            try:
                # Execute the Hardhat deployment
                result = subprocess.run(
    ['npx', 'hardhat', 'run', '/Users/researchassistant/hacklahoma25/AirSpace/deploy.js', '--network', 'sepolia'],
    stdout=subprocess.PIPE,  # Capture standard output
    stderr=subprocess.PIPE,  # Capture standard error
    text=True,
    timeout=300  # 5 minute timeout
)
                
                if result.returncode == 0:
                    deployment_status = "success"
                    deployment_output = result.stdout
                else:
                    deployment_status = "failed"
                    deployment_output = result.stderr
                
                return Response({
                    'decision': 'EXECUTE',
                    'deployment_status': deployment_status,
                    'deployment_output': deployment_output,
                    'model_response': response['message']['content']
                })
            
            except subprocess.TimeoutExpired:
                return Response({
                    'error': 'Deployment timeout'
                }, status=408)
            
            except Exception as e:
                return Response({
                    'error': f'Deployment error: {str(e)}'
                }, status=500)
        
        else:
            return Response({
                'decision': 'REJECT',
                'reason': response['message']['content']
            })
    except Exception as e:
        return Response({
            'error': f'Server error: {str(e)}'
        }, status=500)
