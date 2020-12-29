async function deleteVideo(videoId) {
    console.log(`Deleting video ${videoId}`);

    const response = await fetch(`/videos/${videoId}`, {
        method: 'DELETE',
    });
    location.reload();
};

function profileAddVideo() {
    window.location = '/videos/add';
};

function logout() {
    // delete the session cookie
    document.cookie = "my-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location = '/';
};