from django.urls import path
from .views import get_all_nfts,create_legal_agreement,analyze_deployment

urlpatterns = [
    path('nfts/', get_all_nfts, name='get_all_nfts'),
    path('nft/agreement/', create_legal_agreement, name='create_legal_agreement'),
    path('analyze_deployment/', analyze_deployment, name='analyze_deployment'),
]
