const Notification = require('../../model/Notification/Notification'); // Adjust the path as necessary
const { mongoose } = require('mongoose');

///////////////////////////////////////////////
//////////////     admins        //////////////
///////////////////////////////////////////////
const createWebsiteAdminNotification = async (name, websiteType, pageId, pageSlug) => {
    try {
        const commonAdminId = "6743505365e60677769330af";
        const notificationTemplate = websiteType === "Joinus" ? "671b8ba097c9f58eb0f61373" : "665c6ef5d91dd3e0ac11cb0f";

        const notification = {
            notificationTemplate: notificationTemplate,
            replacement: {
                websiteType: websiteType,
                name: name
            },
            user: {
                id: commonAdminId,
                userType: "AllAdmin"
            },
            pageDirected: {
                id: pageId,
                slug: pageSlug
            }
        };

        // Insert single notification into the database
        await Notification.create(notification);

    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports = {
    createWebsiteAdminNotification
};
