const { runtime, menus, tabs, bookmarks, i18n } = browser;

// ID constants

enum MenuItemIds {
    Tab = "dretab_tab_menu_item",
    Bookmark = "dretab_bookmark_menu_item"
}

// Utility functions

const openTab = (index: number, url?: string): Promise<browser.tabs.Tab> => tabs.create({ index, url });

const getBookmarkUrls = async (bookmarkId: string): Promise<string[]> => {
    try {
        const [ bookmark ] = await bookmarks.get(bookmarkId);
        const urls = bookmark.type === "folder"
            ? await bookmarks
                .getChildren(bookmarkId)
                .then(arr => arr.map(e => e.url))
            : [ bookmark.url ];

        return urls
            .filter((url): url is string => !!url)
            .filter(url => !url.match(/^(javascript|place):/i));
    } catch (e) {
        return [];
    }
}

// Menu actions setup

runtime.onInstalled.addListener(() => {
    menus.create({
        id: MenuItemIds.Tab,
        contexts: ["tab"],
        title: i18n.getMessage("newTab")
    });

    menus.create({
        id: MenuItemIds.Bookmark,
        contexts: ["bookmark"],
        title: i18n.getMessage("openBookmark")
    });
});

// Action listeners

menus.onClicked.addListener(({ menuItemId }, tab) => {
    menuItemId === MenuItemIds.Tab && tab && openTab(tab.index + 1);
});

menus.onClicked.addListener(async ({ menuItemId, bookmarkId }) => {
    if (menuItemId !== MenuItemIds.Bookmark)
        return;

    const [[ tab ], urls] = await Promise.all([
        tabs.query({ currentWindow: true, active: true }),
        getBookmarkUrls(bookmarkId)
    ]);
    urls.forEach((url, i) => openTab(tab.index + 1 + i, url));
});
