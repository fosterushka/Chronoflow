import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { Meeting, RelatedItem } from "../core/types/ICardModal.ts";
import { formatFileSize, getMeetingPlatform, validateUrl } from "../core/utils/contextUtils.ts";

interface ContextTabProps {
  meetings?: Meeting[];
  relatedItems?: RelatedItem[];
  onMeetingsChange: (meetings: Meeting[]) => void;
  onRelatedItemsChange: (items: RelatedItem[]) => void;
}

const DeleteIcon = () => (
  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function ContextTab({
  meetings = [],
  relatedItems = [],
  onMeetingsChange,
  onRelatedItemsChange,
}: ContextTabProps) {
  const [newMeetingUrl, setNewMeetingUrl] = useState("");
  const [newRelatedUrl, setNewRelatedUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleAddMeeting = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newMeetingUrl || !validateUrl(newMeetingUrl)) return;

    const platform = getMeetingPlatform(newMeetingUrl);
    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      platform,
      url: newMeetingUrl,
      title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Meeting`,
    };

    onMeetingsChange([...meetings, newMeeting]);
    setNewMeetingUrl("");
  };

  const handleAddRelatedLink = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newRelatedUrl || !validateUrl(newRelatedUrl)) return;

    const newItem: RelatedItem = {
      id: crypto.randomUUID(),
      type: "link",
      title: new URL(newRelatedUrl).hostname,
      url: newRelatedUrl,
    };

    onRelatedItemsChange([...relatedItems, newItem]);
    setNewRelatedUrl("");
  };

  const handleFileUpload = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    setUploadingFile(true);
    try {
      const file = input.files[0];
      const fileUrl = URL.createObjectURL(file);

      const newItem: RelatedItem = {
        id: crypto.randomUUID(),
        type: "file",
        title: file.name,
        url: fileUrl,
        size: file.size,
        mimeType: file.type,
      };

      // Clean up previous file URLs to prevent memory leaks
      relatedItems
        .filter((item) => item.type === "file")
        .forEach((item) => URL.revokeObjectURL(item.url));

      onRelatedItemsChange([...relatedItems, newItem]);
      input.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    return () => {
      relatedItems
        .filter((item) => item.type === "file")
        .forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [relatedItems]);

  return (
    <div class="space-y-3">
      {/* Meetings Section */}
      <div>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Meetings
        </div>
        <div class="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div class="space-y-1.5 pr-2">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                class="flex items-center gap-2 py-1.5 px-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {meeting.title}
                  </div>
                  <a
                    href={meeting.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs text-blue-500 hover:text-blue-600 truncate block"
                  >
                    Join {meeting.platform} meeting
                  </a>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMeetingsChange(meetings.filter((m) => m.id !== meeting.id));
                  }}
                  class="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <DeleteIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div class="mt-2 flex gap-2">
          <input
            type="url"
            value={newMeetingUrl}
            onInput={(e) => setNewMeetingUrl(e.currentTarget.value)}
            placeholder="Paste meeting URL (Zoom, Google Meet, Teams)"
            class="flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={handleAddMeeting}
            class="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>

      {/* Related Items Section */}
      <div>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Related Items
        </div>
        <div class="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div class="space-y-1.5 pr-2">
            {relatedItems.map((item) => (
              <div
                key={item.id}
                class="flex items-center gap-2 py-1.5 px-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {item.title}
                  </div>
                  <div class="flex items-center gap-2">
                    {item.type === "file" && (
                      <div class="text-xs text-gray-500">
                        {formatFileSize(item.size!)}
                      </div>
                    )}
                    {item.type === "file" ? (
                      <a
                        href={item.url}
                        download={item.title}
                        class="text-xs text-blue-500 hover:text-blue-600"
                      >
                        Download
                      </a>
                    ) : (
                      item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-xs text-blue-500 hover:text-blue-600 truncate"
                        >
                          Open {item.type}
                        </a>
                      )
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRelatedItemsChange(relatedItems.filter((i) => i.id !== item.id));
                  }}
                  class="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <DeleteIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div class="mt-2 space-y-2">
          <div class="flex gap-2">
            <input
              type="url"
              value={newRelatedUrl}
              onInput={(e) => setNewRelatedUrl(e.currentTarget.value)}
              placeholder="Add related link"
              class="flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={handleAddRelatedLink}
              class="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <div class="flex items-center gap-2">
            <label class="flex-1">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                class="hidden"
              />
              <div class="px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors cursor-pointer text-center">
                {uploadingFile ? "Uploading..." : "Upload File"}
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
