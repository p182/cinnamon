var js_req = document.getElementsByClassName("js");

for (var i = 0; i < js_req.length; i++) {
    js_req[i].style.display = "inline";
}

function toggle_textbox(id) {
    var textbox = document.getElementById(id + "-textbox");
    if (textbox.style.display == "none") {
        textbox.style.display = "block";
    } else {
        textbox.style.display = "none";
    }
}

function trigger_modal(id) {
    var modal = document.getElementById(id);
    if (modal.style.display == "none") {
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
}

function close_modal(event) {
    var modal = document.getElementsByClassName("modal");
    for (var i = 0; i < modal.length; i++) {
        if (event.target == modal[i]) {
            modal[i].style.display = "none";
        }
    }
}

function show_channels() {
    var channels = document.getElementById("sidebar");

    if (channels.style.display == "none") {
        channels.style.display = "block";
    } else {
        channels.style.display = "none";
    }
}

function show_settings() {
    var settings = document.getElementById("settings");

    if (settings.style.display == "none") {
        settings.style.display = "block";
    } else {
        settings.style.display = "none";
    }
}

function show_all(id) {
    var item_to_show = document.getElementById(id + "-full");
    var show_label = document.getElementById(id + "-show");
    var original_text = document.getElementById(id + "-start");

    if (item_to_show.style.display === "none") {
        item_to_show.style.display = "inline";
        show_label.innerHTML = "Show less";

        original_text.innerHTML = original_text.innerHTML.replace("...", "");
    } else {
        item_to_show.style.display = "none";
        show_label.innerHTML = "Show more";

        original_text.innerHTML = original_text.innerHTML + " ...";
    }
}

function show_video(url, id) {
    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = "640";
    iframe.height = "480";
    iframe.frameborder = "0";
    iframe.allowfullscreen = "true";
    iframe.style.display = "block";
    var to_replace = document.getElementById(id);
    to_replace.parentNode.replaceChild(iframe, to_replace);
}

// replace urls on all embedded videos
var all_videos = document.getElementsByClassName("embedded_video");

for (var i = 0; i < all_videos.length; i++) {
    var id = all_videos[i].id;
    all_videos[i].href = "#" + id + "-heading";
}

var all_reaction_links = document.getElementsByClassName("reaction");

for (var i = 0; i < all_reaction_links.length; i++) {
    var id = all_reaction_links[i].id;
    all_reaction_links[i].href = "#";
}

function submit_micropub(id, url) {
    var form = document.getElementById(id + "-form");
    fetch('/react?is_reply=true', {
        method: 'POST',
        body: new URLSearchParams({
            "h": "entry",
            "in-reply-to": url,
            "content": form.value,
            "uid": id
        })
    }).then(function(response) {
        if (response.ok) {
            send_notification("<p>Your reply has been sent.</p>");
        } else {
            send_notification("<p>There was an error sending your reply.</p>");
        }
        toggle_textbox(id);
    });
}
function subscribe_modal() {
    var modal = document.getElementById("subscribe-modal");
    if (modal.style.display == "none") {
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
}
function show_list_form() {
    var form = document.getElementById("list-form");
    if (form.style.display == "none") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
}
function send_notification(notification_text) {
    var notification = document.createElement("section");
    var body = document.getElementsByTagName("body")[0];
    notification.className = "notification_bar";
    notification.innerHTML = notification_text;
    // add notification to top of body
    body.insertBefore(notification, body.firstChild);

    setTimeout(function() {
        body.removeChild(notification);
    }, 5000);
}

function post_note(all_uploaded_photos) {
    // send form-encoded response to micropub endpoint
    var form = document.getElementById("content");

    var in_reply_to = document.getElementById("reply_to");

    var rsvp = document.getElementById("rsvp");

    var rating = document.getElementById("rating");

    if (form.innerText.length < 10) {
        send_notification("<p>Your note must be at least 10 characters long.</p>");
        return;
    }

    if (in_reply_to.value || rsvp.value || rating.value) {
        var url = "/react?is_reply=true"

        var content = form.innerText;

        if (rsvp) {
            content += '<span class="p-rsvp">' + rsvp.value + '</span> ';
        }

        if (rating) {
            content += '<span class="p-rating">' + rating.value + '</span> ';
        }

        var post_body = new URLSearchParams({
            "h": "entry",
            "in-reply-to": in_reply_to.value,
            "content": content += all_uploaded_photos,
            "uid": in_reply_to.value
        });
    } else {
        var url = "/react?is_reply=note";

        var post_body = new URLSearchParams(
            {
                "h": "entry",
                "content": form.innerText += all_uploaded_photos
            }
        )
    }
    
    fetch(url, {
        method: 'POST',
        body: post_body,
    }).then(function(response) {
        if (response.ok) {
            send_notification("<p>Your post has been created.</p>");
            form.value = "";
        } else {
            send_notification("<p>There was an error sending your reply.</p>");
        }
    });
}

function send_reaction(reaction, reaction_name, post_url, post_id) {
    fetch('/react', {
        method: 'POST',
        body: new URLSearchParams({
            "h": "entry",
            "reaction": reaction,
            "url": post_url,
            "uid": post_id
        })
    }).then(function(response) {
        // if status code == 200
        if (response.status == 200) {
            send_notification("<p>Your " + reaction_name + " has been sent.</p>");
        }
        var reaction_link = document.getElementById(post_id + "-" + reaction);
        reaction_link.classList.add("reacted");
    })
}

function send_unfollow(url, id) {
    fetch('/unfollow', {
        method: 'POST',
        body: new URLSearchParams({
            "channel": id,
            "url": url
        })
    }).then(function(response) {
        // if status code == 200
        if (response.status == 200) {
            send_notification("<p>You have unfollowed the feed.</p>");
        }
        var list_item = document.getElementById(id);

        list_item.parentNode.removeChild(list_item);
    })
}