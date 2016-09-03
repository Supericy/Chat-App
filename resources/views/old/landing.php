<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min.js" integrity="sha256-ly8TiTtwVsBWdjekTqTJlLGz3Rsg4YXr80eK6QhtdMs=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.1.0.min.js" integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://js.pusher.com/3.2/pusher.min.js"></script>

    <style>
        div {
            padding: 16px;
        }
    </style>

    <script>
        // Enable pusher logging - don't include this in production
//        Pusher.logToConsole = true;
//
//        var pusher = new Pusher('944b0bdac25cd6df507f', {
//            authEndpoint: '/api/v1/pusher/auth',
//            encrypted: true
//        });
//
//        var channel = pusher.subscribe('general');
//        channel.bind('test_event', function(data) {
//            alert(data.message);
//        });
//
//        var pchannel = pusher.subscribe('private-general');
//        pchannel.bind('test_event', function(data) {
//            alert(data.message);
//        });


        var MessageListViewModel = function () {
            var self = this;

            this.text = ko.observable("");
            this.messages = ko.observableArray([
                new MessageViewModel("Welcome!"),
            ]);

            this.send = function () {
                if (this.text() !== "") {
                    this.messages.push(new MessageViewModel(this.text()));
                }

                this.text("");
            };
        };

        var MessageViewModel = function (text) {
            var self = this;

            this.text = ko.observable(text);
        };







        $(function () {
            ko.applyBindings(new MessageListViewModel(), $('#chat')[0]);
        });
    </script>
</head>
<body>
<div>
    <button id="send-test-general">Send General</button>
    <button id="send-test-private-general">Send Private General</button>
</div>

<div id="chat">

    <form data-bind="submit: send">
        <input type="text" data-bind='textInput: text' />
        <button type="submit" data-bind="enable: text().length > 0">send</button>
    </form>

    <ul data-bind="foreach: messages">
        <li>
            <p data-bind="text: message()"></p>
        </li>
    </ul>
</div>

</body>
</html>