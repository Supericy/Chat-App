<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chatty</title>

    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" href="css/normalize.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/login-modal.css">

<!--    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.1/URI.min.js"></script>-->
<!--    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js"></script>-->
<!---->
<!--    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min.js"></script>-->
<!--    <script type="text/javascript" src="https://code.jquery.com/jquery-3.1.0.js"></script>-->
<!--    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>-->
<!---->
<!--    <script type="text/javascript" src="https://js.pusher.com/3.2/pusher.js"></script>-->

<!--    <script src='http://cdnjs.cloudflare.com/ajax/libs/nicescroll/3.5.4/jquery.nicescroll.js'></script>-->

</head>
<body>

<login params="skipAuth: skipAuth, onAuthSuccess: $root.init.bind($root)"></login>

<div class="ui">
    <div class="left-menu">
        <channel-list params="channels: channels, channel: channel, me: me"></channel-list>
        <user-list params="channel: channel"></user-list>
    </div>

    <chat-pane class="chat" params="channel: channel, me: me"></chat-pane>
</div>

<script src="/scripts/vendor-bundle.js"></script>
<script src="/scripts/app-bundle.js"></script>

</body>
</html>
