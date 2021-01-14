//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Blowdryer"
})

const item2 = new Item({
  name: "Sweep the Floor"
})

const item3 = new Item({
  name: "Finish Udemy Course"
})

const exampleItem = [item1, item2, item3]
const newList = []

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {



  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
        Item.insertMany(exampleItem, function(err){
  if(err){
    console.log(err)
  }
  else{
    console.log("Successfully Added")
  }
});
    res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list
  const day = date.getDate();


  const newItem = new Item({
      name: itemName
  })

  if(listName === day){
    newItem.save()
    res.redirect("/")
  } else{
     List.findOne({ name: listName}, function(err, foundList){
       foundList.items.push(newItem) 
       foundList.save()
       res.redirect("/" + listName)
     })
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  
  if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId , function(err){
    if(!err){
      res.redirect("/")
    }}
  )
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, obj){
      if(!err){
          res.redirect("/" + listName)
      }
    })
  }


})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName)
 

  List.findOne({name: customListName }, function(err, obj){
    if(!err){
      if(!obj){
        const list = new List({
          name: customListName,
          items: newList
        });
      
        list.save();
        res.redirect("/" + customListName)
      }
      else {
        res.render("list", {listTitle: obj.name, newListItems: obj.items});
      }
    }
  })
  


})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
