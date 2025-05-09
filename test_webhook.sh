#!/bin/bash

# Save the JSON payload to a temporary file
cat > /tmp/geoply_test_data_final_structure_v2.json << 'EOL'
{
  "projectType": "self-build",
  "roofType": "double-pitch",
  "wallDepth": "200mm",
  "cladding": "metal",
  "roofing": "tiles",
  "length": 10.5,
  "width": 8.2,
  "height": 3.5,
  "windows": {
    "SKYLARK250_WINDOW-M1": 1,
    "SKYLARK250_WINDOW-S1": 1,
    "SKYLARK250_WINDOW-XL1": 1,
    "SKYLARK250_WINDOW-L1": 1,
    "SKYLARK250_WINDOW-L3": 1,
    "SKYLARK250_WINDOW-L2": 1,
    "SKYLARK250_WINDOW-M2": 1,
    "SKYLARK250_WINDOW-S4": 1,
    "SKYLARK250_WINDOW-M4": 1,
    "SKYLARK250_WINDOW-S2": 1,
    "SKYLARK250_WINDOW-XL2": 1,
    "SKYLARK250_WINDOW-XL4": 1,
    "SKYLARK250_WINDOW-XL3": 1,
    "SKYLARK250_WINDOW-M3": 1,
    "SKYLARK250_WINDOW-S3": 1,
    "SKYLARK250_WINDOW-L4": 1,
    "SKYLARK200_WINDOW-XL1": 1,
    "SKYLARK200_WINDOW-S1": 1,
    "SKYLARK200_WINDOW-L2": 1,
    "SKYLARK200_WINDOW-L1": 1,
    "SKYLARK200_WINDOW-M1": 1,
    "SKYLARK200_WINDOW-M2": 1,
    "SKYLARK200_WINDOW-S2": 1,
    "SKYLARK200_WINDOW-XL2": 1,
    "SKYLARK200_WINDOW-L3": 1,
    "SKYLARK200_WINDOW-L4": 1,
    "SKYLARK200_WINDOW-M3": 1,
    "SKYLARK200_WINDOW-M4": 1,
    "SKYLARK200_WINDOW-S4": 1,
    "SKYLARK200_WINDOW-S3": 1,
    "SKYLARK200_WINDOW-XL4": 1,
    "SKYLARK200_WINDOW-XL3": 1
  },
  "doors": {
    "SKYLARK250_DOOR-S1": 1,
    "SKYLARK250_DOOR-M1": 1,
    "SKYLARK250_DOOR-XL1": 1,
    "SKYLARK250_DOOR-L1": 1,
    "SKYLARK250_DOOR-M2": 1,
    "SKYLARK250_DOOR-S2": 1,
    "SKYLARK250_DOOR-XL2": 1,
    "SKYLARK250_DOOR-L2": 1,
    "SKYLARK200_DOOR-S1": 1,
    "SKYLARK200_DOOR-M1": 1,
    "SKYLARK200_DOOR-L1": 1,
    "SKYLARK200_DOOR-XL1": 1,
    "SKYLARK200_DOOR-L2": 1,
    "SKYLARK200_DOOR-M2": 1,
    "SKYLARK200_DOOR-S2": 1,
    "SKYLARK200_DOOR-XL2": 1
  },
  "skylights": {
    "SKYLARK250_SKYLIGHT-M": 1,
    "SKYLARK250_SKYLIGHT-L": 1,
    "SKYLARK250_SKYLIGHT-S": 1,
    "SKYLARK250_SKYLIGHT-XS": 1,
    "SKYLARK250_SKYLIGHT-XXS": 1,
    "SKYLARK200_SKYLIGHT150-XXXS": 1,
    "SKYLARK200_SKYLIGHT-S": 1,
    "SKYLARK200_SKYLIGHT-XS": 1,
    "SKYLARK200_SKYLIGHT-XXXS": 1,
    "SKYLARK200_SKYLIGHT-XXS": 1
  },
  "name": "Alice Wonderland (Final Structure Test v2)",
  "email": "alice.wonderland.final.v2@example.com",
  "phone": "07700 900000",
  "address": "100 Final Street, London, UK",
  "preferredContactMethod": "Phone",
  "howDidYouHear": "Friend/Referral",
  "message": "Testing webhook with final structure v2 including cladding and roofing (commas fixed).",
  "submittedAt": "2025-04-29T16:25:00+01:00"
}
EOL

# --- Debugging: Validate JSON before sending ---
echo "Validating JSON..."
if jq . /tmp/geoply_test_data_final_structure_v2.json > /dev/null; then
  echo "JSON is valid."

  # Send the JSON payload to the Zapier webhook
  echo "Sending data to webhook..."
  curl -v -X POST \
    -H "Content-Type: application/json" \
    -d @/tmp/geoply_test_data_final_structure_v2.json \
    https://hooks.zapier.com/hooks/catch/22140673/2pi7h4e/

  # Optional: Check curl exit status
  if [ $? -eq 0 ]; then
    echo -e "\nCurl command executed successfully."
  else
    echo -e "\nCurl command failed with exit code $?."
  fi

else
  echo "ERROR: JSON is invalid. Please check the structure above the 'EOL'."
  # Optionally display the invalid JSON attempt
  # cat /tmp/geoply_test_data_final_structure_v2.json
fi
# --- End Debugging ---


# Clean up
# Only remove if JSON was valid and curl likely succeeded, or remove manually after checking
# rm /tmp/geoply_test_data_final_structure_v2.json

echo -e "\nScript finished."