import { JSX } from "preact";
import { useState } from "preact/hooks";
import type { Meeting, RelatedItem } from "../core/types/ICardModal.ts";
import {
    formatFileSize,
    getMeetingPlatform,
    validateUrl,
} from "../core/utils/contextUtils.ts";
import { UrlInput } from "./ui/UrlInput.tsx";

interface ContextTabProps {
    meetings?: Meeting[];
    relatedItems?: RelatedItem[];
    onMeetingsChange: (meetings: Meeting[]) => void;
    onRelatedItemsChange: (items: RelatedItem[]) => void;
}

const DeleteIcon = () => (
    <svg
        class="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
        />
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
    const [meetingUrlError, setMeetingUrlError] = useState("");
    const [relatedUrlError, setRelatedUrlError] = useState("");

    const addMeeting = () => {
        if (!newMeetingUrl) return;

        if (!validateUrl(newMeetingUrl)) {
            setMeetingUrlError("Please enter a valid URL");
            return;
        }

        const platform = getMeetingPlatform(newMeetingUrl);
        const newMeeting: Meeting = {
            id: crypto.randomUUID(),
            platform,
            url: newMeetingUrl,
            title: `${
                platform.charAt(0).toUpperCase() + platform.slice(1)
            } Meeting`,
        };

        onMeetingsChange([...meetings, newMeeting]);
        setNewMeetingUrl("");
        setMeetingUrlError("");
    };

    const addRelatedLink = () => {
        if (!newRelatedUrl) return;

        if (!validateUrl(newRelatedUrl)) {
            setRelatedUrlError("Please enter a valid URL");
            return;
        }

        try {
            const newItem: RelatedItem = {
                id: crypto.randomUUID(),
                type: "link",
                title: new URL(newRelatedUrl).hostname,
                url: newRelatedUrl,
            };

            onRelatedItemsChange([...relatedItems, newItem]);
            setNewRelatedUrl("");
            setRelatedUrlError("");
        } catch (error) {
            setRelatedUrlError("Invalid URL format");
        }
    };

    const handleFileUpload = async (e: Event) => {
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
                fileType: file.type,
                fileSize: file.size,
                fileUrl,
            };

            onRelatedItemsChange([...relatedItems, newItem]);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploadingFile(false);
        }
    };

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
                                    onClick={() =>
                                        onMeetingsChange(
                                            meetings.filter((m) =>
                                                m.id !== meeting.id
                                            ),
                                        )}
                                    class="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div class="mt-2">
                    <UrlInput
                        value={newMeetingUrl}
                        onChange={(value) => {
                            setNewMeetingUrl(value);
                            setMeetingUrlError("");
                        }}
                        error={meetingUrlError}
                        placeholder="Paste meeting URL (Zoom, Google Meet, Teams)"
                        onSubmit={addMeeting}
                    />
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
                                                {formatFileSize(item.fileSize!)}
                                            </div>
                                        )}
                                        {item.type === "file"
                                            ? (
                                                <a
                                                    href={item.fileUrl}
                                                    download={item.title}
                                                    class="text-xs text-blue-500 hover:text-blue-600"
                                                >
                                                    Download
                                                </a>
                                            )
                                            : item.url && (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="text-xs text-blue-500 hover:text-blue-600 truncate"
                                                >
                                                    Open {item.type}
                                                </a>
                                            )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRelatedItemsChange(
                                            relatedItems.filter((i) =>
                                                i.id !== item.id
                                            ),
                                        )}
                                    class="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div class="mt-2 space-y-2">
                    <UrlInput
                        value={newRelatedUrl}
                        onChange={(value) => {
                            setNewRelatedUrl(value);
                            setRelatedUrlError("");
                        }}
                        error={relatedUrlError}
                        placeholder="Add related link"
                        onSubmit={addRelatedLink}
                    />
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
