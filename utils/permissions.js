const db = require("../database/db");

async function hasPermission(member, permission) {

    // בעל הבוט תמיד מורשה
    if (member.id === process.env.OWNER_ID) {
        return true;
    }


    // בדיקת מנהלים
    const managerRoles = db.prepare(
        "SELECT role_id FROM manager_roles WHERE guild_id = ?"
    ).all(member.guild.id);


    const isManager = managerRoles.some(role =>
        member.roles.cache.has(role.role_id)
    );


    if (permission === "MANAGER") {
        return isManager;
    }


    // אם אין דרישה מיוחדת
    return false;
}


module.exports = {
    hasPermission
};