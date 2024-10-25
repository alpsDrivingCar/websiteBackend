const Notification = require('../../model/Notification/Notification'); // Adjust the path as necessary
const { mongoose } = require('mongoose');

///////////////////////////////////////////////
//////////////     admins        //////////////
///////////////////////////////////////////////
const createWebsiteAdminNotification = async (name, websiteType, pageId, pageSlug) => {
    try {

        const adminIds = await mongoose.connection.db
            .collection('admins')
            .find({})
            .project({ _id: 1 })
            .toArray();


        const adminIdStrings = adminIds.map(doc => doc._id.toString());
        const notificationTemplate = websiteType === "Joinus" ? "671b8ba097c9f58eb0f61373" : "665c6ef5d91dd3e0ac11cb0f";

        const notifications = adminIdStrings.map(adminId => {
            return {
                notificationTemplate: notificationTemplate,
                replacement: {
                    websiteType: websiteType,
                    name: name
                },
                user: {
                    id: adminId,
                    userType: "AllAdmin"
                },
                pageDirected: {
                    id: pageId,
                    slug: pageSlug
                }
            };
        });

        // Insert notifications into the database
        await Notification.insertMany(notifications);

    } catch (err) {
        console.log(err);
        throw err; // Rethrow the error to be handled by the caller
    }
}

module.exports = {
    createWebsiteAdminNotification
};
