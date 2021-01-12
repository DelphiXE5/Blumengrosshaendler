const { Model, DataTypes } = require("sequelize");

function start(orm) {
    class Plant extends Model { }
    Plant.init({
        id: { type: DataTypes.INTEGER, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.BLOB },
        price: { type: DataTypes.FLOAT, allowNull: false },
        stock: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        sequelize: orm,
        modelName: 'Plant'
    })

    return new Plant
}

module.exports = (orm) => { return start(orm) }