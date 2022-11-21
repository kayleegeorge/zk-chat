
export enum RoomType {
    DM = 'DirectMessage',
    SemaphoreGroup = 'Semaphore', // can join group if in a certain Semaphore group
    GatekeepersGroup = 'Gatekeepers', // only appointed gatekeepers can add members
    
    // PubGroup = 'PublicGroup', // could also distinguish as pub/priv
    // PrivGroup = 'PrivateGroup' // restrictions
}

