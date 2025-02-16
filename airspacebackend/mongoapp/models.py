from djongo import models

class NFT(models.Model):
    nft_token = models.CharField(max_length=255)
    seller_address = models.CharField(max_length=255)
    nft_name = models.CharField(max_length=255)
    nft_address = models.CharField(max_length=255)
    nft_value = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'NFT_information'  # MongoDB collection name
# from djongo import models

class NFTTransaction(models.Model):
    nft_token_id = models.CharField(max_length=255)
    nft_value = models.CharField(max_length=255)
    buyer_address = models.CharField(max_length=255)
    seller_address = models.CharField(max_length=255)

    class Meta:
        db_table = ''  # MongoDB collection name

    def __str__(self):
        return f"NFT {self.nft_token_id} - {self.nft_value}"

