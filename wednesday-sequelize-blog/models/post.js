'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Post.hasMany(models.Comment, {
        as: "comments",
        foreignKey: "post_id",
      });
    }
  };
  Post.init({
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    category: DataTypes.STRING,
    is_published: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};