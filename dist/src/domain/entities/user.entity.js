"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Role = void 0;
var Role;
(function (Role) {
    Role["STUDENT"] = "STUDENT";
    Role["ADMIN"] = "ADMIN";
    Role["PROFESSOR"] = "PROFESSOR";
})(Role || (exports.Role = Role = {}));
class User {
    id;
    name;
    username;
    email;
    _password;
    role;
    constructor(id, name, username, email, _password, role) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this._password = _password;
        this.role = role;
    }
    get passwordHash() { return this._password; }
    setPasswordHash(newHash) { this._password = newHash; }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map