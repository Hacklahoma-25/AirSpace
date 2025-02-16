from django.http import JsonResponse
from .models import NFT

def get_all_nfts(request):
    nfts = NFT.objects.all()  # Fetch all NFTs from MongoDB
    nfts_list = list(nfts.values())  # Convert queryset to list of dictionaries
    return JsonResponse(nfts_list, safe=False)
# import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ollama import chat


OLLAMA_MODEL = "phi3:latest"  # Change to your preferred model (e.g., "llama3", "gemma")

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
