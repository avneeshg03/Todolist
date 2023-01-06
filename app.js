const express = require("express");
const bodyParser = require("body-parser");
const { application } = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();


//console.log(date);

//var item = "";

const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-avneesh:Test123@cluster0.q35gpgn.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todoList."
});

const item2 = new Item({
    name: "Hit the + button to add your item to list."
});

const item3 = new Item({
    name: "<-- Hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function (err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Successfully added the default items.");
//     }

// });

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

    //var newListItem = "";
    // let today = new Date();

    // let currentDay = today.getDay();

    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };

    // let day = today.toLocaleDateString("en-US", options);

    const day = date.getDate();

    Item.find({}, function (err, results) {

        if (results.length == 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added the default items.");
                }

            });
            res.redirect("/");
        } else {
            res.render("list", { listItem: "Today", newListItems: results });
        }

    });

});

app.get("/:customListName", function (req, res) {

    const day = date.getDate();
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                console.log("Doesn't Exist.");
                const list = new List(
                    {
                        name: customListName,
                        items: defaultItems
                    }
                );
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                console.log("Exists.");
                res.render("list", { listItem: foundList.name, newListItems: foundList.items });
            }
        }
    });


    console.log(req.params.customListName);
});

// app.get("/work", function (req, res) {
//     res.render("list", { listItem: "Work", newListItems: workItems });
// });

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.listType;

    const newDoc = new Item({
        name: itemName
    });

    if (listName == "Today") {
        newDoc.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(newDoc);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listItem;

    if (listName == "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: listName }, { item: { _id: checkedItemId } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started at port 3000");
});