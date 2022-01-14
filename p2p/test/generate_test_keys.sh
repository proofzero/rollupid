#!/bin/bash
openssl genrsa  -out private.key 2048
openssl rsa -in private.key -outform PEM -pubout -out public.key


openssl genrsa  -out private_bad.key 2048
openssl rsa -in private_bad.key -outform PEM -pubout -out public_bad.key
