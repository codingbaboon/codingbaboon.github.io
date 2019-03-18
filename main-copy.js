let numOwners = 0;
let itemsArray = [];
let ownersArray = [];
let runningTotal = 0.00;
let inputMode = false;
let firstRun = true;

function onStart() {
    setEventsListener();
}

//Sets the initial event listeners
function setEventsListener() {
    //Event Listener: Will update number of owners when button is clicked.
    const OKbutton = document.getElementById("OKbutton");
    OKbutton.addEventListener("click", onOKButtonClick);
    /*Event Listener: When user clicks into input box, price of the item
    should change with user input*/
    const priceInput = document.querySelector(".item-price-input");
    document.addEventListener("change", (eventTarget) => {
        const className = eventTarget.srcElement.className;
        if (className && className.includes('item-price-input')) {
            getItemPrice(eventTarget.srcElement.id,
                eventTarget.srcElement.parentElement.childNodes[4]);
        }
    });
    //Event Listener: When user clicks on a checkbox, update the Item object's claims
    document.addEventListener("click", (eventTarget) => {
        const className = eventTarget.srcElement.className;
        if (className && className.includes('owner-option')) {
            const inputElement = eventTarget.srcElement;
            const ancestorWrap = eventTarget.srcElement.closest(".item-wrap");
            updateClaims(eventTarget.srcElement, ancestorWrap);
        }
    });

    //Event Listener: When user clicks on 'Select All' button, all checkboxes are checked
    document.addEventListener("click", (eventTarget) =>{
        const className = eventTarget.srcElement.className;
        if (className && className.includes('selectAllButton')){
            const ancestorWrap = eventTarget.srcElement.closest(".item-wrap");
            updateClaimsAll(ancestorWrap);   
        }
    })

    //Event Listener: When user clicks on 'Label' button, input field to change item name
    //appears and allows user to enter a new name for item
    setLabelEventListeners();

    //Event listeners to add functionality to add item and caluclate
    const addItemButton = document.getElementById("add-item-button");
    addItemButton.addEventListener("click", addItem);
    const calculateButton = document.getElementById("calculate-button");
    calculateButton.addEventListener("click", onCalculateButtonClick);
}


function onOKButtonClick() {
    if(!firstRun){
        return;
    }
    getNumOwners();
    updateOwnersArray();
    createOwnerNames();
    setNameEventListeners();
    unhideButtons();
    firstRun = false;
    //if pressing the OKbutton again to update number of owners
}

function unhideButtons(){
    document.getElementById("buttons-div").style.visibility = "visible";
}

function setNameEventListeners(){
    /*Event Listener: When user clicks on change name button, input element will become visible.
    Will allow user to type in a custom name*/

    /*Event Listener (part 1): Show the input field*/
    const renameOwnerButtonArray = document.querySelectorAll(".renameOwnerButton");
    for(let i=0; i<renameOwnerButtonArray.length; i++){
        renameOwnerButtonArray[i].addEventListener("click", (eventTarget)=>{
            const renameOwnerButtonId = eventTarget.srcElement.id;
            const idEnding = renameOwnerButtonId.replace("rename-ownerName-button-","");
            showInputField(idEnding, 0);
            const targetInputElem = document.getElementById("name-input-" + idEnding); 
            targetInputElem.focus();//focuses the input field (so blur can work in part 2)

        });
    }
    /*Event Listener (part 2): update the owner name when input field changes*/
    const nameInputArray = document.querySelectorAll(".name-input");
    for(let i=0; i<nameInputArray.length; i++){
        nameInputArray[i].addEventListener("blur", (eventTarget)=>{
            const nameInputId = eventTarget.srcElement.id;
            const idEnding = nameInputId.replace("name-input-","");
            updateOwnerName(idEnding);
        });
    }
}

function setLabelEventListeners(){
    /*Event Listener: When user clicks on 'label' button, will allow the user
    to change the item name*/
    document.addEventListener("click",(eventTarget)=>{
        /*Event Listener (part 1): change the item header*/
        const eventSrc= eventTarget.srcElement;
        if (eventSrc.className && eventSrc.className === "labelButton"){
            //Upon clicking, shows the input field to allow user to enter new item name
            const labelButtonId = eventTarget.srcElement.id;
            const idEnding = labelButtonId.replace("label-button-", "");
            showInputField(idEnding, 1);
            //to make blur work
            const targetInputElem = document.getElementById("item-name-input-" + idEnding); 
            targetInputElem.focus();

            /*Event Listener (part 2): update the item name in the item object*/
            const itemInputArray = document.querySelectorAll(".itemNameInput");
            for(let i=0; i<itemInputArray.length; i++){
                itemInputArray[i].addEventListener("blur", (eventTarget)=>{
                    const itemInputId = eventTarget.srcElement.id;
                    const idEnding = itemInputId.replace("item-name-input-", "");
                    updateItemName(idEnding);
                });
            }
        }
    });
    
}

//0 = show input field to change owner name
//1 = show input field to change item name
function showInputField(idEnding, type) {
    //inputMode = true;
    if(type == 0){
        const targetInputElem = document.getElementById("name-input-" + idEnding); 
        //changes input type from hidden to text 
        targetInputElem.type = "text";
    }else if(type == 1){
        targetInputElem = document.getElementById("item-name-input-" + idEnding);
        //changes input type from hidden to text 
        targetInputElem.type = "text";
    }

}
    
function updateOwnerName(idEnding){
    //Update owner name being displayed
    //In owner summary at top
    const targetNameSpan = document.getElementById("owner-name-" + idEnding); 
    const inputtedName = document.getElementById("name-input-" + idEnding);
    //Only update the owner name if the input was not blank
    if(inputtedName.value != ""){
        //updates the owner name on top
        targetNameSpan.textContent = inputtedName.value;
        //updates the name choice in the item box
        if(itemsArray.length > 0){
            const increment = parseInt(numOwners);
            let ownerLIArray = document.querySelectorAll("#owners-list li span");
            for(let i=parseInt(idEnding)-1; i<ownerLIArray.length; i += increment){
                ownerLIArray[i].textContent = inputtedName.value;
            }
        }
        //Update owner's nickname in Owner object
        ownersArray[idEnding-1].nickname = inputtedName.value;
    }
    hideInputField(idEnding, 0);
    //Update owner name under each Item section
    //query selector sequence (all list items in class owners-list)
    /*TO DO: make this more space efficient later
    Currently takes all LI items even though we are ony updating a few 
    (array gets longer with every item added)
    Additionally, we remake the array from scratch */

}

function updateItemName(idEnding){
    const targetNameSpan = document.getElementById("item-header-" + idEnding); 
    const oldName = targetNameSpan.value;
    const inputtedName = document.getElementById("item-name-input-" + idEnding);

    //error handling for if user does not actually enter a new item name
    if(inputtedName.value !== oldName && inputtedName.value !== ""){
        targetNameSpan.textContent = inputtedName.value; 
        //update item object nickname
        itemsArray[idEnding-1].itemName = inputtedName.value;
    }
    hideInputField(idEnding, 1);


}



function hideInputField(idEnding, type){
    //type 0 = owner name input
    //type 1 = item name input
    if(type == 0){
        const targetInputSpan = document.getElementById("name-input-" + idEnding);
        targetInputSpan.type = "hidden";
    }else if (type == 1){
        const targetInputSpan = document.getElementById("item-name-input-" + idEnding);
        targetInputSpan.type = "hidden";
    }
}

function onCalculateButtonClick() {
    calculate();
    displaySummary();
}

function getNumOwners() {
    numOwners = document.getElementById("num-owners").value;
    document.getElementById("owners-result").textContent = numOwners;
}

function updateOwnersArray() {
    for (let i = 0; i < numOwners; i++) {
        ownersArray.push(new Owner(i + 1));
    }

}

function createOwnerNames() {
    const targetElement = document.getElementById("owner-names-list");
    for (let i = 0; i < numOwners; i++) {
        //display default names (Person 1, Person 2)
        const newLI = document.createElement("li");
        const newSpan = document.createElement("span");
        newSpan.className = "owner-name";
        newSpan.id = "owner-name-" + (i + 1);
        newSpan.textContent = ownersArray[i].nickname;

        //create input element for user to type in a new owner name
        const newNameInput = document.createElement("input");
        newNameInput.type = "hidden";
        newNameInput.className = "name-input";
        newNameInput.id = "name-input-" + (i + 1);
        newNameInput.placeholder = "Person " + (i + 1);

        //create "change name" button to rename owners
        const renameOwnerButton = document.createElement("button");
        renameOwnerButton.className = "renameOwnerButton";
        renameOwnerButton.id = "rename-ownerName-button-" + (i+1);
        renameOwnerButton.textContent = "Rename";

        newLI.appendChild(newNameInput);
        newLI.appendChild(newSpan);
        newLI.appendChild(renameOwnerButton);
        targetElement.appendChild(newLI);
    }
}

function getItemPrice(inputID, textElement) {
    //Display inputted item price
    const inputElement = document.getElementById(inputID);
    let price = inputElement.value;
    if(isNaN(parseFloat(price))){
        price = 0;
    }
    textElement.textContent = `$${price}`;

    //Update the price in the Item Object
    const inputIDStr = inputID.replace("priceinput", "");
    const itemIndex = parseInt(inputIDStr, 10) - 1;
    const oldPrice = itemsArray[itemIndex].price;
    itemsArray[itemIndex].price = price;

    //update the running total)
    updateRunningTotal(oldPrice, price);
}

function addItem() {
    console.log("item object added");
    //add Item object to the Items Array
    const itemID = (itemsArray.length + 1);
    itemsArray.push(new Item(itemID, numOwners));
    //create the wapper div
    let newDiv = document.createElement("div");
    newDiv.id = "item" + itemID;
    newDiv.className = "item-wrap";
    //create the h4 header (item name)
    const newH4 = document.createElement("h4");
    newH4.className = "item-header";
    newH4.id = "item-header-" + itemID;
    newH4.textContent = "Item " + (itemsArray.length);
    //create the 'label' button to rename the item
    const newLabelButton  = makeLabelButton(itemID);
    //create the user input element to rename the item name
    const newItemNameInput = makeItemNameInput(itemID);
    //create the user input element (for price)
    const newInput = document.createElement("input");
    newInput.className = "item-price-input";
    newInput.id = "priceinput" + itemsArray.length;
    newInput.setAttribute("type", "number");
    newInput.setAttribute("placeholder", "Enter item price");
    //create the span element (to display inputted price)
    const newSpan = document.createElement("span");
    newSpan.className = "item-price";
    //create the owner options section
    const newOwnersDiv = makeOwnerSection();
    //creates the 'select all' button
    const newSelectAllButton = makeSelectAllButton(itemID);
    //add all new elements to to the webpage
    newDiv.appendChild(newH4);
    newDiv.appendChild(newItemNameInput);
    newDiv.appendChild(document.createElement("br"));
    newDiv.appendChild(newInput);
    newDiv.appendChild(newSpan);
    newDiv.appendChild(newOwnersDiv);
    newDiv.appendChild(newSelectAllButton);
    newDiv.appendChild(newLabelButton);
    const buttonsDiv = document.getElementById("buttons-div");
    document.body.insertBefore(newDiv, buttonsDiv);
}
function makeSelectAllButton(itemID){
    const newButton = document.createElement("button");
    newButton.className = "selectAllButton";
    newButton.id = "select-all-button-" + itemID;
    newButton.value = "Select All";
    newButton.textContent = "Select Everyone";
    return newButton;
}

function makeLabelButton(itemID){
    const newButton = document.createElement("button");
    newButton.className = "labelButton";
    newButton.id = "label-button-" + itemID;
    newButton.textContent = "Label Item";//Label
    return newButton;
}

function makeItemNameInput(itemID){
    const newInput = document.createElement("input");
    newInput.className = "itemNameInput";
    newInput.id = "item-name-input-" + itemID;
    newInput.type = "hidden";
    newInput.placeholder= "Enter item name";
    return newInput;
}

function makeOwnerSection() {
    //create the owner options (Goes under each item)
    const newOwnersDiv = document.createElement("div");
    newOwnersDiv.className = "owners-wrap";
    const newUL = document.createElement("ul");
    newUL.id = "owners-list";
    for (let i = 0; i < numOwners; i++) {
        const newListItem = document.createElement("li");
        const newSpan = document.createElement("span");
        const newCheckbox = document.createElement("input");
        newCheckbox.type = "checkbox";
        newCheckbox.className = "owner-option"
        newCheckbox.value = "owner" + (i + 1);
        newSpan.textContent = ownersArray[i].nickname;
        newListItem.appendChild(newCheckbox);
        newListItem.appendChild(newSpan);
        newUL.appendChild(newListItem);
    }
    newOwnersDiv.appendChild(newUL);

    return newOwnersDiv;
}

/*TO DO: make this more efficient for select all. 
It currently updates the claims array and button more than needed (for every element in loop)*/
function updateClaims(inputElement, ancestorWrap) {
    //ancestorWrap will be the outter-most item-wrap 
    const itemIndexStr = ancestorWrap.id.replace("item", "");
    const itemIndex = parseInt(itemIndexStr) - 1;

    const inputValueStr = inputElement.value.replace("owner", "");
    const claimsIndex = parseInt(inputValueStr) - 1;

    const targetItem = itemsArray[itemIndex];

    if (inputElement.checked) {
        targetItem.claimed[claimsIndex] = 1;
        targetItem.numClaimers += 1;
    } else {
        targetItem.claimed[claimsIndex] = 0;
        targetItem.numClaimers -= 1;
    }
}

//Select All button was clicked. Update claims and toggle button.
function updateClaimsAll(ancestorWrap){
        //ancestorWrap will be the outter-most item-wrap 
        const itemIndexStr = ancestorWrap.id.replace("item", "");
        const itemIndex = parseInt(itemIndexStr) - 1;
        const targetItem = itemsArray[itemIndex];

        //get all owner options for the item
        const ownerOptionsArray = ancestorWrap.querySelectorAll(".owner-option");
        //get the Select All button for that item section
        const button = ancestorWrap.querySelector(".selectAllButton");

        if(button.value.includes("Select All")){
            //button is in select all mode, so select all owner options
            targetItem.numClaimers = numOwners;
            for (let i=0; i<targetItem.claimed.length; i++){
                //update the item object: change claimed status of all owners to 'claimed'
                targetItem.claimed[i] = 1;
            }
            for(let i=0; i<ownerOptionsArray.length; i++){
                //check the owner options
                ownerOptionsArray[i].checked = true;
            }
            //update the button value and display
            button.value = "Deselect All";
            button.textContent = "Deselect Everyone";
        }else{
            //button is in deselect all mode, so deselect all owner options
            targetItem.numClaimers = 0;
            for (let i=0; i<targetItem.claimed.length; i++){
                //update the item object: change claimed status of all owners to 'not claimed'
                targetItem.claimed[i] = 0;
            }
            for(let i=0; i<ownerOptionsArray.length; i++){
                //check the owner options
                ownerOptionsArray[i].checked = false;
            }
            //update the button value and display
            button.value = "Select All";
            button.textContent = "Select Everyone";
        }

}

function calculate() {
    resetOwnerTotals();
    for (let i = 0; i < itemsArray.length; i++) {
        const targetItem = itemsArray[i];
        const allocPrice = targetItem.price / targetItem.numClaimers;

        for (let j = 0; j < targetItem.claimed.length; j++) {
            if (targetItem.claimed[j] > 0) {
                ownersArray[j].total += allocPrice;
                ownersArray[j].claimedItems.push([targetItem, allocPrice]);
            }
        }

    }
}

function resetOwnerTotals() {
    for (let i = 0; i < ownersArray.length; i++) {
        const owner = ownersArray[i];
        owner.resetTotal();
        owner.resetClaimedItems();
    }
}

//TO DO: FIX THE RNNING TOTAL - ADDS WRONG IF CHANGE PRICE OT SOMETHING SMALLER
//NEED TO RUN THROUGH ITEM ARRAY OR SELECT THE CHANGED ITEM AND +/- THAT AMT
function updateRunningTotal(oldPrice, itemPrice) {
    // if(isNaN(parseFloat(itemPrice))){
    //     itemPrice = 0.00;
    // }
    runningTotal -= parseFloat(oldPrice); 
    runningTotal += parseFloat(itemPrice);
    const targetElement = document.getElementById("running-total");
    targetElement.textContent = "Total: $" + runningTotal.toFixed(2);
}

function displaySummary() {
    const newWrapperDiv = document.createElement("div");
    newWrapperDiv.id = "summary";
    for (let i = 0; i < ownersArray.length; i++) {
        const targetOwner = ownersArray[i];

        const newDiv_owner = document.createElement("div");
        newDiv_owner.className = "owner-div";

        const newSpan_name = document.createElement("span");
        newSpan_name.className = "nickname-span";
        newSpan_name.textContent = targetOwner.nickname + ": ";

        const newUL_claimedItems = document.createElement("ul");
        let targetOwnerTotal = 0;
        for (let j = 0; j < targetOwner.claimedItems.length; j++) {
            const newLI_item = document.createElement("li");
            const targetClaimedItem = targetOwner.claimedItems[j];
            const claimedItemCost = targetClaimedItem[1];
            targetOwnerTotal += claimedItemCost;
            newLI_item.textContent = targetClaimedItem[0].itemName + " - $" + claimedItemCost.toFixed(2);
            newUL_claimedItems.appendChild(newLI_item);
        }

        const newSpan_ownerTotal = document.createElement("span")
        newSpan_ownerTotal.className = "ownerTotal-span";
        newSpan_ownerTotal.textContent = "$"+ targetOwnerTotal.toFixed(2);
        //newSpan_ownerTotal.textContent = `$${targetOwner.total}`;

        newDiv_owner.appendChild(newSpan_name);
        newDiv_owner.appendChild(newSpan_ownerTotal);
        newDiv_owner.appendChild(newUL_claimedItems);
        newWrapperDiv.appendChild(newDiv_owner);
    }
    document.getElementById("summary-wrapper").innerHTML = "";
    document.getElementById("summary-wrapper").appendChild(newWrapperDiv);
}


window.onload = onStart;