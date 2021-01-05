const { menus, tabs, bookmarks } = browser;

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
        const urls = bookmark.children?.map(e => e.url) ?? [ bookmark.url ];
        return urls.filter((url): url is string => !!url)
            .filter(url => !url.match(/^(javascript|place):/i));
    } catch (e) {
        return [];
    }
}

// Tab menu

menus.create({
    id: MenuItemIds.Tab,
    contexts: ["tab"],
    title: "Nueva pestaña a la derecha"
});

menus.onClicked.addListener(({ menuItemId }, tab) => {
    menuItemId === MenuItemIds.Tab && tab && openTab(tab.index + 1);
});

// Bookmark menu

menus.create({
    id: MenuItemIds.Bookmark,
    contexts: ["bookmark"],
    title: "Abrir en una pestaña a la derecha"
});

menus.onClicked.addListener(async ({ menuItemId, bookmarkId }, tab) => {
    if (menuItemId !== MenuItemIds.Bookmark || !tab)
        return;
    
    const urls = await getBookmarkUrls(bookmarkId);
    urls.forEach(url => openTab(tab.index + 1, url));
});
