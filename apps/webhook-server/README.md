<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

# Violet Webhook

**Accessing school data, because I can.**

</div>

# How to generate a key pair

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
cat jwtRS256.key
cat jwtRS256.key.pub
```