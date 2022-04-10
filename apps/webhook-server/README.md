<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

# Violet Webhook

**Accessing school data, because I can.**

</div>

# How to generate a key pair

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f function.key
# Don't add passphrase
openssl rsa -in function.key -pubout -outform PEM -out function.key.pub
cat function.key
cat function.key.pub
```