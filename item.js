class Item {
    constructor(itemType="food", itemID, totalOwners){
        switch(itemType){
            case "tax":
                this.itemName = "Tax";
                break;
            case "tip":
                this.itemName = "Tip";
                break;
            case "food":
                this.itemName = "Item " + itemID;
        }
        this.itemID = itemID;
        this.price = 0.00;
        this.claimed = this.createClaimsArray(totalOwners);
        this.numClaimers = 0;
        //add trait for type of item (food item, tip, tax, etc.)
        
    }

    createClaimsArray(totalOwners){
        const claimsArr = [];
        for (let i=0; i<totalOwners; i++){
            claimsArr.push(0);
        }
        return claimsArr;
    }
}