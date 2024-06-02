const Notification = require('../../model/Notification/Notification'); // Adjust the path as necessary

///////////////////////////////////////////////
//////////////     admins        //////////////
///////////////////////////////////////////////
const createWebsiteAdminNotification = async (name, websiteType, pageId, pageSlug) => {
    try {
        let notificationData = {
            notificationTemplate: "665c6ef5d91dd3e0ac11cb0f",
            replacement: {
                websiteType: websiteType,
                name: name
            },
            user: {
                id: "65abc62447f75c99188c2cc0",
                userType: "AllAdmin"
            },
            pageDirected: {
                id: pageId,
                slug: pageSlug
            }
        };

        const newNotification = new Notification(notificationData);
        console.log("crewaet ");
        return await newNotification.save();

    } catch (err) {
        console.log(err);
        throw err; // Rethrow the error to be handled by the caller
    }
}

module.exports = {
    createWebsiteAdminNotification
};
