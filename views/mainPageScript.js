if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ready);
}
else {
    ready()
}

function ready() {
    generateAllItems();
    const searchBar = document.querySelector(".SearchBar");
    const inputSearchBar = searchBar.querySelector("input");
    searchBar.addEventListener("click", () => {
        inputSearchBar.focus();
    });
    inputSearchBar.addEventListener('input', updateSearchResults);

    function updateSearchResults(){
        const text = inputSearchBar.value;
        const itemDiv = document.getElementsByClassName("itemRows")[0];
        let childElements = itemDiv.children;
        while(childElements.length > 0){
            itemDiv.removeChild(childElements[0]);
            childElements = itemDiv.children;
        }
        if(text.length === 0){
            generateAllItems();
        }
        else{
            generateItems(text);
        }
    }

    function generateAllItems(){
        const itemRows = document.getElementsByClassName("itemRows")[0];
        for(let i = 0; i<shopItemsData.length; i++){
            const item = document.createElement("div");
            item.classList.add("item")
            item.innerHTML = createItem(shopItemsData[i].name, shopItemsData[i].price, shopItemsData[i].image, shopItemsData[i].description);
            itemRows.append(item);
        }
        setUpAddToCartButtons();
    }

    function generateItems(text){
        const itemRows = document.getElementsByClassName("itemRows")[0];
        for(let i = 0; i<shopItemsData.length; i++){
            if(shopItemsData[i].name.slice(0, text.length) === text){
                const item = document.createElement("div");
                item.classList.add("item")
                item.innerHTML = createItem(shopItemsData[i].name, shopItemsData[i].price, shopItemsData[i].image, shopItemsData[i].description);
                itemRows.append(item);
            }
        }
        setUpAddToCartButtons();
    }

    function createItem(name, price, image, description){
        return `
          <img src="/images/${image}" class="itemPhoto" alt="">
          <h1 class="itemName">Nazwa: ${name}</h1>
          <h2 class="itemPrice">Cena: ${price}</h2>
          <p class="itemDescription">Opis: ${description}</p>
          <button class="itemAddCart" data-name="${name}" data-price="${price}" data-image="${image}">Dodaj do koszyka</button>
        `
    }


    const mainPageButton = document.querySelector(".MainPage");
    mainPageButton.addEventListener("click", () => {
        window.location.href = "/";
    });

    function setUpRemoveButtons(){
        const removeButtons = document.getElementsByClassName("btn-danger");
        for (let i = 0; i < removeButtons.length; i++) {
            const removeButton = removeButtons[i];
            removeButton.addEventListener('click', removeCartItem);
        }
    }

    function setupQuantityButtons(){
        const increaseQuantityButton = document.getElementsByClassName("cart-quantity-input");
        for (let i = 0; i < increaseQuantityButton.length; i++) {
            const input = increaseQuantityButton[i];
            input.addEventListener('change', quantityChanged);
        }
    }

    function setUpAddToCartButtons(){
        const addToCartButtons = document.getElementsByClassName("itemAddCart");
        for(let i = 0; i < addToCartButtons.length; i++){
            const addButton = addToCartButtons[i];
            addButton.addEventListener("click", addToCartClicked);
        }
    }

    function setUpButtons(){
        setUpRemoveButtons();
        setupQuantityButtons();
        setUpAddToCartButtons();
    }



    const purchaseButton = document.getElementsByClassName("btn-purchase")[0];
    purchaseButton.addEventListener('click', purchaseItems);

    function addToCartClicked(event){
        const addButton = event.target;
        const nameItem = addButton.dataset.name;
        const priceItem = addButton.dataset.price;
        const imageItem = addButton.dataset.image;
        addToCart(nameItem, priceItem, imageItem);
        updateCartTotal();
        setUpButtons();
    }

    function removeCartItem(event) {
        const buttonClicked = event.target;
        buttonClicked.parentElement.parentElement.remove();
        updateCartTotal();
    }

    function quantityChanged(event) {
        const input = event.target;
        if (isNaN(input.value) || input.value <= 0) {
            input.value = 1;
        }
        updateCartTotal();
    }

    function updateCartTotal() {
        const totalPriceElement = document.getElementsByClassName('cart-total-price')[0];
        const cartItems = document.getElementsByClassName("cart-items")[0];
        const cartRows = cartItems.getElementsByClassName("cart-row");
        let totalPrice = 0;
        for (let i = 0; i < cartRows.length; i++) {
            const cartRow = cartRows[i];
            const priceElement = cartRow.getElementsByClassName("cart-price")[0];
            const quantityElement = cartRow.getElementsByClassName("cart-quantity-input")[0];
            const price = parseFloat(priceElement.innerText);
            const quantity = quantityElement.value;
            totalPrice += (price * quantity);
        }
        totalPrice = Math.round(totalPrice * 100) / 100;
        totalPriceElement.innerText = totalPrice + " zł"
    }

    function addToCart(name, price, image) {
        const cartRow = document.createElement('div');
        cartRow.classList.add('cart-row')
        const cartItems = document.getElementsByClassName('cart-items')[0];
        const cartItemsNames = cartItems.getElementsByClassName("cart-item-title");
        for (let i = 0; i < cartItemsNames.length; i++) {
            if (cartItemsNames[i].innerText === name) {
                alert("Ten przedmiot jest już w koszyku!");
                return;
            }
        }
        cartRow.innerHTML = `
            <div class="cart-item cart-column">
                <img class="cart-item-image" src="images/${image}" width="100" height="100" alt="">
                <span class="cart-item-title">${name}</span>
            </div>
            <span class="cart-price cart-column">${price}</span>
            <div class="cart-quantity cart-column">
                <input class="cart-quantity-input" type="number" value="1">
                <button class="btn btn-danger" type="button">USUN</button>
            </div>
        `;
        cartItems.append(cartRow);
    }

    async function purchaseItems() {
        if (isAuth === false) {
            alert("Musisz byc zalogowany");
            return;
        }
        const cartItems = document.getElementsByClassName('cart-items')[0];
        const cartItemsNames = cartItems.getElementsByClassName("cart-item-title");
        const cartItemsId = [];
        const itemAmount = cartItemsNames.length;
        for (let i = 0; i < itemAmount; i++) {
            await fetch(`/getItemIdByName/${cartItemsNames[i].innerText}`)
                .then(response => response.json())
                .then(data => {
                    cartItemsId.push(data.itemId);
                })
                .catch(error => console.error('Error:', error));
        }
        const cartItemsQuantity = cartItems.getElementsByClassName("cart-quantity-input");
        const cartItemsQuantities = [];
        for (let i = 0; i < itemAmount; i++) {
            cartItemsQuantities.push(cartItemsQuantity[i].value);
        }
        for (let i = 0; i < itemAmount; i++) {
            const itemId = cartItemsId[i];
            const quantity = cartItemsQuantities[i];
            await fetch(`placeOrder/${itemId}/${quantity}`, {
                method: "POST"
            }).then(() => {
            });
        }
        window.location.href = "/";
    }

}