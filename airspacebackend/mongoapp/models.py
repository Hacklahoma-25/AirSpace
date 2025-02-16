from djongo import models

class NFT(models.Model):
    title = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.TextField()
    property_address = models.CharField(max_length=255)
    current_height = models.CharField(max_length=255)
    maximum_height = models.CharField(max_length=255)
    available_floors = models.CharField(max_length=255)
    price = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    contract_address = models.CharField(max_length=255)
    token_id = models.IntegerField()
    
    class Meta:
        db_table = 'NFT_information'  # MongoDB collection name

class NFTTransaction(models.Model):
    nft_token_id = models.CharField(max_length=255)
    nft_value = models.CharField(max_length=255)
    buyer_address = models.CharField(max_length=255)
    seller_address = models.CharField(max_length=255)

    class Meta:
        db_table = ''  # MongoDB collection name

    def __str__(self):
        return f"NFT {self.nft_token_id} - {self.nft_value}"

