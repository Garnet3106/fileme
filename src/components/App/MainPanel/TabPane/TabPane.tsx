import { useState } from 'react';
import NativeWindow from '../../../../common/native_window';
import { preferences } from '../../../../common/preferences';
import { Tab, TabIcon } from '../../../../common/tab';
import { generateUuid } from '../../../../common/utils';
import './TabPane.css';
import TabPaneItem from './TabPaneItem/TabPaneItem';

export const variables = {
    height: 30,
};

export default function TabPane() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

    const styles = {
        container: {
            backgroundColor: preferences.appearance.background.panel2,
            height: `${variables.height}px`,
        },
        items: {
            width: `calc(100vw - ${150 + 1}px)`,
        },
    };

    const tabItems = tabs.map((eachTab) => (
        <TabPaneItem
            item={eachTab}
            selected={eachTab.id === selectedTabId}
            onClick={selectTab}
            onClickCloseIcon={closeTab}
            key={eachTab.id}
        />
    ));

    return (
        <div className="tab-pane-container" style={styles.container}>
            <div className="tab-pane-items" style={styles.items}>
                {tabItems}
            </div>
            <div className="tab-pane-operations">
                <div className="tab-pane-operation-icon tab-pane-operation-icon-minimize" onClick={NativeWindow.minimize} />
                <div className="tab-pane-operation-icon tab-pane-operation-icon-close" onClick={NativeWindow.close} />
            </div>
        </div>
    );

    function searchTabIndex(id: string): number | undefined {
        const targetIndex = tabs.findIndex((eachTab) => eachTab.id === id);
        return targetIndex !== -1 ? targetIndex : undefined;
    }

    // fix: open(path: ItemPath)
    function openTab(title: string, icon: TabIcon) {
        const newTab = {
            id: generateUuid(),
            icon: icon,
            title: title,
        };

        setTabs((tabs) => [...tabs, newTab]);
        setSelectedTabId(newTab.id);
    }

    function selectTab(id: string) {
        if (searchTabIndex(id) === undefined) {
            console.error(`Couldn't operate unknown or unopened tab ID \`${id}\`.`);
            return;
        }

        setSelectedTabId(id);
    }

    function closeTab(id: string) {
        const targetIndex = searchTabIndex(id);

        if (targetIndex === undefined) {
            console.error(`Couldn't operate unknown or unopened tab ID \`${id}\`.`);
            return;
        }

        setTabs((tabs) => tabs.filter((eachTab) => eachTab.id !== id));

        if (id === selectedTabId) {
            setSelectedTabId(targetIndex > 0 ? tabs[targetIndex - 1].id : null);
        }
    }
}