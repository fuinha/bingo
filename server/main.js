//Require modules
var http = require('http');
var io = require('socket.io');

//Start server
var server = http.createServer();
server.listen(3001);
var socket = io.listen(server);

//Load data from JSON
var items = require('./data.json');
var itemChecklist = items.slice();

/**
 * @returns {Number} Random number between the two given from and to variables
 */
function getRandomNumber(from, to)
{
    return Math.floor(Math.random() * (to - from + 1) + from);
}

/**
 * @returns {Array}
 */
function getBingoItems()
{
    //Define variables
    var originalItems = items.slice();
    var bingoItems = [];

    //Loop for each needed bingo item
    for (var i = 0; i < 16; i++) {
        //Generate a random number and splice it from the total bingo items that are still left
        var randomNumber = getRandomNumber(0, originalItems.length - 1);
        var randomItem = originalItems.splice(randomNumber, 1)[0];

        //Add the BingoItem object to the array
        bingoItems.push(randomItem);
    }

    return bingoItems;
}

/**
 * Remove the item from the itemChecklist & return the check item
 *
 * @param id
 * @returns {number|boolean}
 */
function checkItemOfList(id)
{
    var index = arraySearchMultiDimensional(itemChecklist, 'id', parseInt(id));

    if (index > -1) {
        return itemChecklist.splice(index, 1)[0];
    }

    return false;
}

/**
 * @returns {number}
 */
function arraySearchMultiDimensional(array, key, value)
{
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return i;
        }
    }

    return -1;
}

//Default connection handler when client connects to server
socket.on('connection', socketConnectionHandler);

/**
 * @param socket
 */
function socketConnectionHandler(socket)
{
    //Whenever a user connects, send him the bingo items
    socket.emit('items', getBingoItems());

    //Listeners within connection
    socket.on('click', socketClickHandler.bind(this, socket));
}

/**
 * Triggered when the client clicks a bingo item
 *
 * @param socket
 * @param id
 */
function socketClickHandler(socket, id)
{
    var item = checkItemOfList(id);

    if (item !== false) {
        socket.broadcast.emit('status', item);
    }
}