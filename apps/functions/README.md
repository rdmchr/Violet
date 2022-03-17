<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

# Violet Functions

**Accessing school data, because I can.**

</div>

This function uses Puppeteer to open the school website and fetch the available data.
The data is then stored in a Firestore collection.

# Environment variables

| Variable name | Usage                         |
| ------------- | ----------------------------- |
| WEBSITE_URL   | The URL of the school website |

# Cloud function setup
- **Timeout**: 20seconds
- **Memory**: 512 MB
