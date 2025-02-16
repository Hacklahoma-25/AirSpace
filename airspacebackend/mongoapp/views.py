from django.http import JsonResponse
from .models import NFT
import google.generativeai as genai
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
# import requests
from datetime import datetime
import os
from dotenv import load_dotenv
import re

load_dotenv()
w3 = Web3(Web3.HTTPProvider(os.getenv('ETHEREUM_NODE_URL', 'https://eth-sepolia.g.alchemy.com/v2/l05qmoEsKgcOHBnYvDhWjJD8oRrrG0sw')))
genai.configure(api_key="AIzaSyBnpTrUpfVmBkqXBFTMl_7C81OkXaoh8kw")
model=model = genai.GenerativeModel('gemini-2.0-flash-001')
# You'll need to get an API key from Etherscan
ETHERSCAN_API_KEY = os.getenv('F9BP7FJ5VZKBA6R62KX1NN97J55TSWRDH8')
OLLAMA_MODEL = "phi3.5:3.8b-mini-instruct-q5_K_M"  # Change to your preferred model (e.g., "llama3", "gemma")

def validate_ethereum_address(address):
    """Validate Ethereum address format"""
    return bool(re.match(r'^0x[a-fA-F0-9]{40}$', address))

def get_all_nfts(request):
    nfts = NFT.objects.all()  # Fetch all NFTs from MongoDB
    nfts_list = list(nfts.values())  # Convert queryset to list of dictionaries
    return JsonResponse(nfts_list, safe=False)
# import requests



def generate_legal_agreement(nft_token_id, nft_value, buyer_address, seller_address,Seller_Physical,Buyer_Physical,Seller_Name,Buyer_Name):
    """
    Calls the Ollama model to generate a legal agreement for the NFT transaction.
    """
    prompt = f"""
    Generate a comprehensive, legally binding Air Rights Purchase Agreement with the following details:

BUYER:
Wallet Address: {buyer_address}
Legal Name: {Buyer_Name}
Physical Address: {Buyer_Physical}

SELLER:
Wallet Address: {seller_address}
Legal Name: {Seller_Name}
Physical Address: {Seller_Physical}

ASSET DETAILS:
Air Rights NFT Token ID: {nft_token_id}
Purchase Price: {nft_value} USDC
Execution Date: February 16, 2025

The agreement should include:
Clear definition of Air Rights being transferred, including vertical development rights and view corridor protection
Detailed terms of the blockchain-based transfer using the NFT smart contract
Representations and warranties from both parties
Compliance with local zoning laws and building regulations
Rights and restrictions regarding future development
Transfer of ownership process and confirmation
Dispute resolution mechanisms
Governing law and jurisdiction
Force majeure clauses
Signatures and notarization requirements

The agreement should be structured in formal legal language, with clear sections for definitions, terms, conditions, and execution details. Include specific clauses about the immutable nature of blockchain transactions and the finality of the transfer once executed on-chain.
    """
    
    # response = chat(
    #             model=OLLAMA_MODEL,
    #             messages=[{"role": "user", "content": prompt}]
    #         )
    # return response['message']['content']
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    # Get response
    response = model.generate_content(prompt)
    
    return response.text
    # return response["text"]
    # return "Error: Unable to generate agreement."

@api_view(['POST'])
def create_legal_agreement(request):
    """
    API to generate a legal agreement for an NFT transaction.
    """
    data = request.data
    required_fields = ["nft_token_id", "nft_value", "buyer_address", "seller_address","Buyer_Name","Seller_Name","Buyer_Physical","Seller_Physical"]
    
    # Validate input fields
    for field in required_fields:
        if field not in data:
            return Response({ "error": f"Missing field: {field}" }, status=status.HTTP_400_BAD_REQUEST)

    # Generate legal agreement using Ollama
    agreement_text = generate_legal_agreement(
        data["nft_token_id"],
        data["nft_value"],
        data["buyer_address"],
        data["seller_address"],
        data["Buyer_Name"],
        data["Seller_Name"],
        data["Buyer_Physical"],
        data["Seller_Physical"]

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
    ['npx', 'hardhat', 'run', f'/Users/researchassistant/hacklahoma25/AirSpace/deploy.js ' ,f'--nft-id {tokens} ', '--network', 'sepolia'],
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
