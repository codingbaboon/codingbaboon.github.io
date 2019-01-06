class Owner{
    constructor(id){
        this.id = id;
        this.nickname = "Person " + id;
        this.total = 0;
        this.claimedItems = [];
    }

    resetTotal(){
        this.total = 0;
    }

    resetClaimedItems(){
        this.claimedItems = [];
    }
}