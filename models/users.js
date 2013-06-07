var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var enumGender = ['F','M','U']
  , enumSocialNetwork = ['FB'];
 
var userSchema = new Schema({
	playerId      : String,      
	identity      : String,      
	username      : String,     
	name          : String,      
	email         : String,      
	created       : Date,         
	last_login    : Date,          
	gender        : { type    : String,
						enum    : enumGender,
						default : 'U'},
	location      : String,     
	language      : String,      
	avatar        : String,      
	socialNetwork : { type    : String,
						enum    : enumSocialNetwork,
						default : 'U'},
	playing       : Boolean,       
	status        : Boolean,       
	nLogins       : Number
});

userSchema.statics.returningUser = function (id, sN, cb) {
      this.findOne({ identity: id, socialNetwork : sN }, cb);
}

userSchema.statics.findByUsername = function (username, cb) {
      this.find({ name: new RegExp(username, 'i') }, cb);
}

module.exports = mongoose.model('Users', userSchema);
