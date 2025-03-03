import uuidv7 from "./uuidv7";

const NEXT_PUBLIC_POSTHOG_KEY = import.meta.env.VITE_NEXT_PUBLIC_POSTHOG_KEY;
const NEXT_PUBLIC_POSTHOG_HOST = import.meta.env.VITE_NEXT_PUBLIC_POSTHOG_HOST;
const id = uuidv7();

async function sendEvent(payload: any) {
    try {
        const url = `${NEXT_PUBLIC_POSTHOG_HOST}/i/v0/e/`;
        const headers = {
            "Content-Type": "application/json",
        };

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log("[Metrics]: OK");
        } else {
            console.debug("[Metrics]: failed");
            console.debug("[Metrics]: ", await response.text());
        }
    } catch (e) {
        console.debug("[Metrics]: ", e);
    }
}

export async function sendPosthogPageViewEvent(currentPageUrl: string) {
    const payload = {
        api_key: NEXT_PUBLIC_POSTHOG_KEY,
        event: "$pageview",
        distinct_id: id,
        properties: {
            $current_url: currentPageUrl,
            $process_person_profile: false,
        },
    };

    await sendEvent(payload);
}

export async function sendPosthogPageLeaveEvent(currentPageUrl: string) {
    const payload = {
        api_key: NEXT_PUBLIC_POSTHOG_KEY,
        event: "$pageleave",
        distinct_id: id,
        properties: {
            $current_url: currentPageUrl,
            $process_person_profile: false,
        },
    };

    await sendEvent(payload);
}

export async function sendRemoveBackgroundEvent() {
    const payload = {
        api_key: NEXT_PUBLIC_POSTHOG_KEY,
        event: "remove background",
        distinct_id: id,
        properties: {
            $process_person_profile: false,
        },
    };
    await sendEvent(payload);
}
