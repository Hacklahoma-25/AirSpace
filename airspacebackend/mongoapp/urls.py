from django.urls import path
from .views import get_all_nfts,create_legal_agreement

urlpatterns = [
    path('nfts/', get_all_nfts, name='get_all_nfts'),
]
urlpatterns = [
    path('nft/agreement/', create_legal_agreement, name='create_legal_agreement'),
]