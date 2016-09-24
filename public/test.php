<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-22
 * Time: 2:48 PM
 */

// Payload data you want to send to Android device(s)
// (it will be accessible via intent extras)
$data = array('message' => 'Hello World!');

// The recipient registration tokens for this notification
// https://developer.android.com/google/gcm/
$ids = array('dNM-rYypHOo:APA91bFjpYGxqYkPi_ShWZUeV2mgqJ3xUtE8Bb1SV8-yCJ11-fA2WqYUYOOhqGSqey-XLDH5GxaLaqs-yz7ER_ZAi8UoAHcq5y0OtX63Zhm8MTHsXNg9D5JzqN50xeil1FbonyCP5skQ');
//$ids = array('APA91bFjpYGxqYkPi_ShWZUeV2mgqJ3xUtE8Bb1SV8-yCJ11-fA2WqYUYOOhqGSqey-XLDH5GxaLaqs-yz7ER_ZAi8UoAHcq5y0OtX63Zhm8MTHsXNg9D5JzqN50xeil1FbonyCP5skQ');

// Send push notification via Google Cloud Messaging
sendPushNotification($data, $ids);

function sendPushNotification($data, $ids)
{
    // Insert real GCM API key from the Google APIs Console
    // https://code.google.com/apis/console/
    $apiKey = 'AIzaSyAnR_qszWKoL3FEHNVy6MxnM5LDisR3QBY';

    // Set POST request body
    $post = array(
        'registration_ids'  => $ids,
        'data'              => $data,
    );

    // Set CURL request headers
    $headers = array(
        'Authorization: key=' . $apiKey,
        'Content-Type: application/json'
    );

    // Initialize curl handle
    $ch = curl_init();

    // Set URL to GCM push endpoint
    curl_setopt($ch, CURLOPT_URL, 'https://android.googleapis.com/gcm/send');

    // Set request method to POST
    curl_setopt($ch, CURLOPT_POST, true);

    // Set custom request headers
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    // Get the response back as string instead of printing it
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Set JSON post data
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4 );

    // Actually send the request
    $result = curl_exec($ch);

    // Handle errors
    if (curl_errno($ch))
    {
        echo 'GCM error: ' . curl_error($ch);
    }

    // Close curl handle
    curl_close($ch);

    // Debug GCM response
    echo $result;
}