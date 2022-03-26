<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

# Violet Functions

**Accessing school data, because I can.**

</div>

# fetchTimetable & fetchAnnouncements

This function uses Puppeteer to open the school website and fetch the available data.
The data is then stored in a Firestore collection.

## Environment variables

| Variable name | Usage                         |
| ------------- | ----------------------------- |
| WEBSITE_URL   | The URL of the school website |

## Cloud function setup
- **Timeout**: 20seconds
- **Memory**: 512 MB

# gameManager

This function manages the hidden games inside the app.
Always use this function when modifying the player's points.

## Data

For this function to work correctly, you will need to pass some data depending on your use case

- **TICTACTOE_CREATE**: invitee (the invited user's school name)
- **TICTACTOE_WINNER**: gameId (the Firestore Id of the game)
- **TICTACTOE_SURRENDER**: gameId (the Firestore Id of the game)

### Examples

Check if a tic tac toe game has been won
```JSON
{
    "func": "TICTACTOE_WINNER",
    "gameId": "TU3hQvl1kNZwlEJTxOhU"
}
```
Surrender a tic tac toe game
```JSON
{
    "func": "TICTACTOE_SURRENDER",
    "gameId": "TU3hQvl1kNZwlEJTxOhU"
}
```