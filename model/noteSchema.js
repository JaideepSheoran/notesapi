const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
   user : {
       type: String,
       required: true,
       unique : true
   },

   notes : {
       type : [{
            title : {
                type: String,
                required: true
            },
            tags : {
                type : [String],
                required: true
            },
            note: {
                type: String,
                required: true
            }
        }],
       required: true
   }
});

const Notebook = mongoose.model('NOTEBOOK', noteSchema);
module.exports = Notebook;
