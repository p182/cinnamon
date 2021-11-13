import datetime
from dateutil.parser import parse
from bs4 import BeautifulSoup
from .canonicalize_url import canonicalize_url as canonicalize_url

def process_json_feed(item, feed):
    result = {
        "type": "entry",
    }

    result["url"] = item.get("url")

    if feed.get("author") and not item.get("author"):
        result["author"] = {
            "type": "card",
            "name": feed.get("author").get("name")
        }
        if feed.get("home_page_url"):
            result["author"]["url"] = canonicalize_url(feed.get("home_page_url"), item.get("url").split("/")[2], feed.get("home_page_url"))
        else:
            result["author"]["url"] = canonicalize_url(feed.get("feed_url"), item.get("url").split("/")[2], feed.get("feed_url"))
    elif item.get("author") != None:
        result["author"] = {
            "type": "card",
            "name": item.get("author").get("name"),
            "url": canonicalize_url(item["author"].get("url"), item["author"].get("url").split("/")[2], item["author"].get("url"))
        }

        if item["author"].get("avatar"):
            result["author"]["photo"] = item["author"].get("avatar")

    if item.get("image"):
        result["photo"] = item.get("image")

    # get audio or video attachment
    # only collect one because clients will only be expected to render one attachment
    if item.get("attachments"):
        for i in item.get("attachments"):
            if "audio" in i.get("mime_type"):
                result["audio"] = [{"content_type": i.get("mime_type"), "url": i.get("url")}]
                break
            elif "video" in i.get("mime_type"):
                result["video"] = [{"content_type": i.get("mime_type"), "url": i.get("url")}]
                break

    if item.get("published"):
        parse_date = parse(item["published"])

        if parse_date:
            month_with_padded_zero = str(parse_date.month).zfill(2)
            day_with_padded_zero = str(parse_date.day).zfill(2)
            date = "{}{}{}".format(parse_date.year, month_with_padded_zero, day_with_padded_zero)
        else:
            month_with_padded_zero = str(datetime.datetime.now().month).zfill(2)
            day_with_padded_zero = str(datetime.datetime.now().day).zfill(2)
            date = "{}{}{}".format(datetime.datetime.now().year, month_with_padded_zero, day_with_padded_zero)
    else:
        date = datetime.datetime.now().strftime("%Y%m%d")

    result["published"] = date

    if item.get("content_html"):
        result["content"] = {}
        result["content"]["text"] = BeautifulSoup(item.get("content_html"), "html.parser").get_text()
        result["content"]["html"] = item.get("content_html")

    if item.get("title"):
        result["name"] = item.get("title")

    if item.get("url"):
        result["url"] = item.get("url")

    if item.get("post_type"):
        result["post-type"] = "entry"

    return result, date