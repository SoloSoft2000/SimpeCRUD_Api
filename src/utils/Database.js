"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
var uuid_1 = require("uuid");
var Database = /** @class */ (function () {
    function Database() {
        this.users = [];
    }
    Database.prototype.getUsers = function () {
        return this.users;
    };
    Database.prototype.getUserById = function (userId) {
        if (!(0, uuid_1.validate)(userId)) {
            throw new Error('Invalid userId');
        }
        return this.users.find(function (user) { return user.id === userId; });
    };
    Database.prototype.createUser = function (userData) {
        var newUser = __assign({ id: (0, uuid_1.v4)() }, userData);
        this.users.push(newUser);
        return newUser;
    };
    Database.prototype.deleteById = function (userId) {
        if (!(0, uuid_1.validate)(userId)) {
            throw new Error('Invalid userId');
        }
        var idx = this.users.findIndex(function (user) { return user.id === userId; });
        if (idx === -1) {
            return false;
        }
        else {
            this.users.splice(idx, 1);
            return true;
        }
    };
    Database.prototype.updateById = function (userId, userData) {
        if (!(0, uuid_1.validate)(userId)) {
            throw new Error('Invalid userId');
        }
        var idx = this.users.findIndex(function (user) { return user.id === userId; });
        if (idx === -1) {
            return undefined;
        }
        else {
            this.users[idx] = __assign(__assign({}, this.users[idx]), userData);
            return this.users[idx];
        }
    };
    return Database;
}());
exports.Database = Database;
