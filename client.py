from flask import Blueprint, request, session, redirect, flash, render_template
from .check_token import check_token
from .indieauth import requires_indieauth
import requests
from .actions import *
from .config import *

client = Blueprint('client', __name__)

@client.route("/reader")
def reader_redirect():
    return redirect("/reader/all")

@client.route("/reader/<channel>")
def microsub_reader(channel):
    auth_result = check_token()
    
    if auth_result == False:
        return redirect("/login")
    headers = {
        "Authorization": session["access_token"]
    }

    before = None
    after = None

    if request.args.get("before"):
        before = request.args.get("before")

        microsub_req = requests.get(session.get("server_url") + "?action=timeline&channel={}&before={}".format(channel, before), headers=headers)
    elif request.args.get("after"):
        after = request.args.get("after")

        microsub_req = requests.get(session.get("server_url") + "?action=timeline&channel={}&after={}".format(channel, after), headers=headers)
    else:
        microsub_req = requests.get(session.get("server_url") + "?action=timeline&channel={}".format(channel), headers=headers)

    feeds = requests.get(session.get("server_url") + "?action=follow&channel={}".format(channel), headers=headers).json()

    before_to_show = microsub_req.json()["paging"]["before"]
    after_to_show = microsub_req.json()["paging"]["after"]

    channel_req = requests.get(session.get("server_url") + "?action=channels", headers=headers)

    channel_name = [c for c in channel_req.json()["channels"] if c["uid"] == channel][0]["name"]

    published_dates = [p.get("published") for p in microsub_req.json()["items"]]

    return render_template("client/reader.html",
        title="{} | Microsub Reader".format(channel_name),
        results=microsub_req.json()["items"],
        channels=channel_req.json()["channels"],
        before=before_to_show,
        after=after_to_show,
        page_channel_uid=channel,
        published_dates=published_dates,
        feeds=feeds,
        channel_name=channel_name
    )

@client.route("/read", methods=["POST"])
def mark_channel_as_read():
    auth_result = check_token()

    if auth_result == False:
        return redirect("/login")

    headers = {
        "Authorization": session["access_token"]
    }

    channel = request.form.get("channel")
    status = request.form.get("status")
    last_read_entry = request.form.get("last_read_entry")

    requests.post(session.get("server_url"), data={"action": "timeline", "channel": channel, "method": status, "last_read_entry": last_read_entry}, headers=headers)

    if last_read_entry == "mark_read":
        flash("Posts in this channel were successfully marked as read.")
    else:
        flash("Posts in this channel were successfully marked as unread.")

    return redirect("/reader/{}".format(channel))

@client.route("/reader/<channel>/delete/<entry_id>")
def delete_entry_in_channel(channel, entry_id):
    auth_result = check_token()

    if auth_result == False:
        return redirect("/login")

    headers = {
        "Authorization": session["access_token"]
    }

    data = {
        "action": "timeline",
        "method": "remove",
        "channel": channel,
        "entry": entry_id
    }

    r = requests.post(session.get("server_url"), data=data, headers=headers)

    flash("The entry was successfully deleted.")
    return redirect("/reader/{}".format(channel))

@client.route("/settings")
def settings():
    auth_result = check_token()

    if auth_result == False:
        return redirect("/login")

    headers = {
        "Authorization": session["access_token"]
    }

    r = requests.get(session.get("server_url"), headers=headers)

    return render_template("client/settings.html",
        title="Settings | Microsub Reader",
        channels=r.json()["channels"]
    )