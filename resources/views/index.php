<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chatty</title>

    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="/css/normalize.css">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/login-modal.css">

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.1/URI.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.1.0.js"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="https://js.pusher.com/3.2/pusher.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js"></script>
    <script src='http://cdnjs.cloudflare.com/ajax/libs/nicescroll/3.5.4/jquery.nicescroll.js'></script>

</head>
<body>

<div id="login">
    <div class="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
         aria-hidden="true">
        <div class="modal-dialog">
            <div class="loginmodal-container">
                <h1>Login to Your Account</h1><br>
                <form action="#" data-bind="submit: login">
                    <input type="text" placeholder="Name" data-bind="textInput: name">
                    <input type="password" placeholder="Password" data-bind="textInput: password">
                    <input type="submit" class="login loginmodal-submit" value="Login"
                           data-bind="disable: isAuthenticating()">
                </form>

                <div style="text-align: center; color: orangered" data-bind="text: error()">
                </div>
                <!---->
                <!--                <div class="login-help">-->
                <!--                    <a href="#">Register</a> - <a href="#">Forgot Password</a>-->
                <!--                </div>-->
            </div>
        </div>
    </div>
</div>

<div class="ui">

    <div class="left-menu">
        <div id="channels" style="display: none;" data-bind="visible: true">
            <div class="left-menu-header">
                CHANNELS
                <form action="#" class="input-group search">
                    <input type="text" placeholder="search..."/>
                </form>
            </div>

            <menu class="left-menu-body list-friends list-channels" data-bind="foreach: channels">
<!--                <li data-bind="click: join">-->
                <li>
                    <img width="50" height="50" src="images/no-user-image.gif">
                    <div class="info">
                        <div class="user" data-bind="text: display_name"></div>
                        <div class="status on"> 13 users</div>
                    </div>
                </li>
            </menu>
        </div>

        <div id="users" style="display: none;" data-bind="visible: true">
            <div class="left-menu-header">
                USERS
                <form action="#" class="input-group search" data-bind="textInput: searchQuery">
                    <input type="text" placeholder="search..."/>
                </form>
            </div>

            <menu class="left-menu-body list-friends" data-bind="foreach: filteredUsers()">
                <li>
                    <img width="50" height="50" src="images/no-user-image.gif">
                    <div class="info">
                        <div class="user" data-bind="text: name"></div>
                        <div class="status on"> online</div>
                    </div>
                </li>
            </menu>
        </div>
    </div>




    <div id="chat" class="chat" style="display: none;" data-bind="visible: true">
        <div class="top">
            <div class="avatar">
                <img width="50" height="50" src="http://cs625730.vk.me/v625730358/1126a/qEjM1AnybRA.jpg">
            </div>
            <div class="info">
                <div class="name" data-bind="text: user().name">Your Name</div>
                <!--                <div class="count">already 1 902 messages</div>-->
            </div>
            <div style="display: inline-block; float: right;">
                <button id="send-test-general" data-bind="click: function () {$.get('/broadcast');}">Send Server Message
                </button>
            </div>
        </div>
        <ul class="messages" data-bind="foreach: messages()">
            <li data-bind="css: { 'message-local': isMessageLocal(), 'message-friend': !isMessageLocal() }">
                <div class="head">
                    <span class="time" data-bind="text: moment.utc(timestamp()).local().format('LLL')"></span>
                    <span class="name" data-bind="text: name()"></span>
                </div>
                <div class="message" data-bind="foreach: messageBlocks()">
                    <div data-bind="css: {'message-unconfirmed': !confirmed()}, text: text()"></div>
                </div>
            </li>
        </ul>

        <div class="is-typing" data-bind="foreach: typing()">
            <span data-bind="text: name">X</span> is typing...
        </div>

        <form action="#" id="new-message-form" class="write-form" data-bind="submit: send">
            <textarea class="new-message-area" placeholder="Type your message" name="e" rows="2"
                      maxlength="256"
                      data-bind="textInput: newMessage"></textarea>
            <i class="fa fa-picture-o"></i>
            <i class="fa fa-file-o"></i>
            <input class="btn btn-default send" type="submit" value="send"
                   data-bind="enabled: newMessage().length > 0"/>
        </form>
    </div>


</div>

<script src="/js/bundle.js"></script>

</body>
</html>
