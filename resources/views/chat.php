<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chatty</title>

    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" href="css/normalize.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/login-modal.css">

    <!--Import Google Icon Font-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <!-- Compiled and minified CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/css/materialize.min.css">

    <!-- Compiled and minified JavaScript -->
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js"></script>

    <!--Let browser know website is optimized for mobile-->
<!--    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>-->

    <style>
        header, main, footer {
            padding-left: 300px;
        }

        @media only screen and (max-width: 992px) {
            header, main, footer {
                padding-left: 0;
            }
        }
    </style>
</head>
<body>

<login params="skipAuth: skipAuth, onAuthSuccess: $root.init.bind($root)"></login>

<header>
    <ul id="nav-mobile" class="side-nav full fixed">
<!--        <li>-->
<!--            <div class="userView">-->
<!--                <a href="#!user"><img class="circle" src="images/no-user-image.gif"></a>-->
<!--                <a href="#!name"><span class="name">Unknown</span></a>-->
<!--                <a href="#!email"><span class="email">jdandturk@gmail.com</span></a>-->
<!--            </div>-->
<!--        </li>-->

        <li><div class="divider"></div></li>
        <channel-list params="channels: channels, channel: channel, me: me"></channel-list>

        <li><div class="divider"></div></li>
        <user-list params="channel: channel"></user-list>
    </ul>
</header>

<main class="ui">
    <chat-pane class="chat" params="channel: channel, me: me"></chat-pane>
</main>


<!--<div class="ui">-->

<!--    <div class="left-menu">-->
<!--        <channel-list params="channels: channels, channel: channel, me: me"></channel-list>-->
<!--        <user-list params="channel: channel"></user-list>-->
<!--    </div>-->

<!--    <chat-pane class="chat" params="channel: channel, me: me"></chat-pane>-->
<!--</div>-->

<script src="/scripts/vendor-bundle.js"></script>
<script src="/scripts/app-bundle.js"></script>
<script>
    // Initialize collapse button
    $(".button-collapse").sideNav();
    // Initialize collapsible (uncomment the line below if you use the dropdown variation)
    $('.collapsible').collapsible();
</script>

</body>
</html>
