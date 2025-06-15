import React, { useState } from 'react';
import WorkspaceList from '../components/WorkspaceList';
import ChannelList from '../components/ChannelList';
import MessageFeed from '../components/MessageFeed';

const ChatView = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  return (
    <div className="flex h-full">
      <div className="w-1/5 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Workspaces</h2>
        <WorkspaceList onSelectWorkspace={setSelectedWorkspace} />
      </div>
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        {selectedWorkspace ? (
          <ChannelList 
            workspace={selectedWorkspace} 
            onSelectChannel={setSelectedChannel} 
          />
        ) : (
          <p className="text-gray-500">Select a workspace.</p>
        )}
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {selectedChannel ? (
          <MessageFeed channel={selectedChannel} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">Select a channel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;