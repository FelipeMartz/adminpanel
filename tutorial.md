# C++ Integration Guide for BAID System

This guide explains how to connect your C++ application with the BAID update and presence (heartbeat) system.

## 1. Requirements
To make HTTP requests in C++, we recommend using one of the following:
*   **cURL** (Multiplatform, very stable).
*   **WinInet / WinHTTP** (Native Windows, no external DLLs required).
*   **CPR** (Modern C++ wrapper for cURL).

---

## 2. Update and IP Verification
You should call the `/api/check-update` endpoint when your application starts.

### Example using cURL:
```cpp
#include <iostream>
#include <string>
#include <curl/curl.h>
#include "json.hpp" // We recommend nlohmann/json

using json = nlohmann::json;

void checkUpdate() {
    CURL* curl = curl_easy_init();
    if(curl) {
        std::string response_string;
        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/api/check-update");
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_string);
        
        CURLcode res = curl_easy_perform(curl);
        long http_code = 0;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);

        if (http_code == 403) {
            auto data = json::parse(response_string);
            std::cout << "[BANNED] " << data["message"] << std::endl;
            exit(0);
        }

        if (res == CURLE_OK) {
            auto data = json::parse(response_string);
            std::string remoteVersion = data["version"];
            if (remoteVersion != "1.0.0") {
                std::cout << "New version available: " << remoteVersion << std::endl;
                // The loader will handle the download
            }
        }
        curl_easy_cleanup(curl);
    }
}
```

---

## 3. Presence System (Online Status)
To appear as **Online** in the dashboard, your app must send a "heartbeat" every 10 seconds.

### Recommended Logic:
Run this in a separate **Thread** to avoid blocking your main application execution.

```cpp
#include <thread>
#include <chrono>

void startPresenceHeartbeat(std::string username) {
    std::thread([username]() {
        while (true) {
            CURL* curl = curl_easy_init();
            if (curl) {
                std::string url = "http://localhost:3000/api/presence?username=" + username;
                curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
                curl_easy_perform(curl);
                curl_easy_cleanup(curl);
            }
            // Wait 10 seconds before next heartbeat
            std::this_thread::sleep_for(std::chrono::seconds(10));
        }
    }).detach(); // Run in background
}
```

---

## 4. Endpoints Structure
| Functionality | Method | URL |
| :--- | :--- | :--- |
| Check Update / Ban | `GET` | `/api/check-update` |
| Presence (Online) | `GET` | `/api/presence?username=NAME` |
| Download Main | `GET` | `/downloads/baid.exe` |

## 5. Ban Handling
If the server responds with a **403 Forbidden** status code, the JSON body will contain a `message` field with the ban reason. It is mandatory to close the application in this case to comply with system security.

```json
{
  "banned": true,
  "message": "Your access has been denied. Reason: Terms of service violation"
}
```

---
**Note:** Ensure that both the loader and your C++ executable use the same name (`baid.exe`) for the auto-closing and updating system to work correctly.
