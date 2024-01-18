if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ready);
}
else {
    ready()
}


function ready(){
    var ordersRows = document.getElementsByClassName("ordersRows")[0];

    var itemsDict = {};
    for(var item in itemsData){
        itemsDict[itemsData[item].id] = itemsData[item];
    }

    function ordersGenerate(userId){
        for(var orderNumerator in ordersData){
            var order = ordersData[orderNumerator];
            var orderRow = document.createElement("div");
            orderRow.classList.add("orderRow");
            var itemId = order.item_id;
            var date = order.date;
            var status = order.status;
            var quantity = order.quantity;
            var itemName = itemsDict[itemId].name;
            var itemPrice = itemsDict[itemId].price;
            var itemImage = itemsDict[itemId].image;
            orderRow.innerHTML = createOrderHTML(itemName, itemPrice, itemImage, date, status, quantity);
            ordersRows.append(orderRow);
        }
    }

    function createOrderHTML(name, price, image, date, status, quantity){
        return `
            <img src="/images/${image}" class="orderImage">
            <h1 class="orderItemName">Nazwa: ${name}</h1>
            <h2 class="orderItemPrice">Cena: ${price}</h2>
            <h2 class="orderDate">Data: ${date}</h2>
            <h2 class="orderStatus">Status: ${status}</h2>
            <h2 class="orderQuantity">Ilość: ${quantity}</h2>
        `
    }

    ordersGenerate();
}