address api:

request curl sample:
curl --location 'https://snappfood.ir/mobile/v4/user/user-addresses?lat=35.700000&long=51.400000&optionalClient=PWA&client=PWA&deviceType=PWA&appVersion=6.0.0' \
--header 'sec-ch-ua-platform: "macOS"' \
--header 'Authorization: Bearer <redacted-jwt>' \
--header 'sec-ch-ua: "Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36' \
--header 'Accept: application/json, text/plain, */*' \
--header 'X-Is-Bonyan: true' \
--header 'Cookie: <redacted-cookie>'

response sample:
{
    "status": true,
    "data": {
        "addresses": [
            {
                "id": 12345678,
                "city": {
                    "id": 1,
                    "title": "تهران"
                },
                "address": "<redacted-address>",
                "addressExtra": "<redacted-address-extra>",
                "snappAddressType": null,
                "phone": "<redacted-phone>",
                "lat": "35.700000",
                "long": "51.400000",
                "isConfirmed": true,
                "score": 100
            }
        ]
    }
}
