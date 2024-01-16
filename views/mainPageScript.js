if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ready);
}
else {
    ready()
}


function ready() {
    const searchBar = document.querySelector(".SearchBar");
    const inputSearchBar = searchBar.querySelector("input");
    searchBar.addEventListener("click", (e) => {
        inputSearchBar.focus();
    });

    const mainPageButton = document.querySelector(".MainPage");
    mainPageButton.addEventListener("click", (e) => {
        window.location.href = "/";
    });

    function setUpRemoveButtons(){
        const removeButtons = document.getElementsByClassName("btn-danger");
        for (var i = 0; i < removeButtons.length; i++) {
            var removeButton = removeButtons[i];
            removeButton.addEventListener('click', removeCartItem);
        }
    }

    function setupQuantityButtons(){
        const increaseQuantityButton = document.getElementsByClassName("cart-quantity-input");
        for (var i = 0; i < increaseQuantityButton.length; i++) {
            var input = increaseQuantityButton[i];
            input.addEventListener('change', quantityChanged);
        }
    }

    function setUpButtons(){
        setUpRemoveButtons();
        setupQuantityButtons();
    }



    const addToCartButtons = document.getElementsByClassName("itemAddCart");
    for(var i = 0; i < addToCartButtons.length; i++){
        var addButton = addToCartButtons[i];
        var nameItem = addButton.dataset.name;
        var priceItem = addButton.dataset.price;
        var imageItem = addButton.dataset.image;
        addButton.addEventListener("click", addToCartClicked);

    }

    const purchaseButton = document.getElementsByClassName("btn-purchase")[0];
    purchaseButton.addEventListener('click', purchaseItems);

    function addToCartClicked(event){
        var addButton = event.target;
        var nameItem = addButton.dataset.name;
        var priceItem = addButton.dataset.price;
        var imageItem = addButton.dataset.image;
        addToCart(nameItem, priceItem, imageItem);
        updateCartTotal();
        setUpButtons();
    }


    function removeCartItem(event) {
        var buttonClicked = event.target;
        buttonClicked.parentElement.parentElement.remove();
        updateCartTotal();
    }

    function quantityChanged(event) {
        var input = event.target;
        if (isNaN(input.value) || input.value <= 0) {
            input.value = 1;
        }
        updateCartTotal();
    }


    function updateCartTotal() {
        var totalPriceElement = document.getElementsByClassName('cart-total-price')[0];
        var cartItems = document.getElementsByClassName("cart-items")[0];
        var cartRows = cartItems.getElementsByClassName("cart-row")
        var totalPrice = 0;
        for (var i = 0; i < cartRows.length; i++) {
            var cartRow = cartRows[i];
            var priceElement = cartRow.getElementsByClassName("cart-price")[0];
            var quantityElement = cartRow.getElementsByClassName("cart-quantity-input")[0];
            var price = parseFloat(priceElement.innerText);
            var quantity = quantityElement.value;
            totalPrice += (price * quantity);
        }
        totalPrice = Math.round(totalPrice * 100) / 100;
        totalPriceElement.innerText = totalPrice + " zł"
    }

    function addToCart(name, price, image) {
        var cartRow = document.createElement('div');
        cartRow.classList.add('cart-row')
        var cartItems = document.getElementsByClassName('cart-items')[0];
        var cartItemsNames = cartItems.getElementsByClassName("cart-item-title");
        for (var i = 0; i < cartItemsNames.length; i++) {
            if (cartItemsNames[i].innerText === name) {
                alert("Ten przedmiot jest już w koszyku!");
                return;
            }
        }
        var cartRowContent = `
            <div class="cart-item cart-column">
                <img class="cart-item-image" src="images/${image}" width="100" height="100">
                <span class="cart-item-title">${name}</span>
            </div>
            <span class="cart-price cart-column">${price}</span>
            <div class="cart-quantity cart-column">
                <input class="cart-quantity-input" type="number" value="1">
                <button class="btn btn-danger" type="button">USUN</button>
            </div>
        `
        cartRow.innerHTML = cartRowContent;
        cartItems.append(cartRow);
    }

    async function purchaseItems() {
        if ('<%= isAuth %>' === 'false') {
            alert("Musisz byc zalogowany");
            return;
        }
        var cartItems = document.getElementsByClassName('cart-items')[0];
        var cartItemsNames = cartItems.getElementsByClassName("cart-item-title");
        var cartItemsId = [];
        var itemAmount = cartItemsNames.length
        for (var i = 0; i < itemAmount; i++) {
            await fetch(`/getItemIdByName/${cartItemsNames[i].innerText}`)
                .then(response => response.json())
                .then(data => {
                    cartItemsId.push(data.itemId);
                })
                .catch(error => console.error('Error:', error));
        }
        var cartItemsQuantity = cartItems.getElementsByClassName("cart-quantity-input");
        var cartItemsQuantities = [];
        for (var i = 0; i < itemAmount; i++) {
            cartItemsQuantities.push(cartItemsQuantity[i].value);
        }
        for (var i = 0; i < itemAmount; i++) {
            var itemId = cartItemsId[i];
            var quantity = cartItemsQuantities[i];
            await fetch(`placeOrder/${itemId}/${quantity}`, {
                method: "POST"
            }).then((response) => {
            });
        }
        window.location.href = "/";
    }

}