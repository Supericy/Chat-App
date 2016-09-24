<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Landing</title>

    <!--Import Google Icon Font-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <!-- Compiled and minified CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/css/materialize.min.css">

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>

    <!-- Compiled and minified JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js"></script>

    <!--Let browser know website is optimized for mobile-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

    <style>
        main {
            text-align: center;
        }

        .websites {
            display: inline-block;
            width: 400px;
        }

        .websites a {
            width: 100%;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

<?php

class Link {
    public $name;
    public $link;
    public function __construct($name, $link) {
        $this->name = $name;
        $this->link = $link;
    }
}

$links = [
    new Link('chat', 'chat'),
    new Link('chat - no auth', 'chat?skipAuth'),
    new Link('push notification test', 'push-notification-test')
]

?>

<main>
    <div class="websites">
        <?php foreach ($links as $link): ?>

        <a class="waves-effect waves-light btn" href="<?=$link->link?>">
            <i class="material-icons left">cloud</i>
            <?=$link->name?>
            <i class="material-icons right">send</i>
        </a>

        <?php endforeach ?>
    </div>
</main>

</body>
</html>