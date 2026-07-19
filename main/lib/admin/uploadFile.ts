export async function uploadAdminFile(params: {
    file: File;
    parent: string;
    signal?: AbortSignal;
}): Promise<string> {
    const { file, parent, signal } = params;
    const res = await fetch("/admin/api/v1/upload", {
        method: "POST",
        credentials: "include",
        headers: {
            "X-File-Name": encodeURIComponent(file.name),
            "X-File-Parent": encodeURIComponent(parent),
            ...(file.type ? { "Content-Type": file.type } : {}),
        },
        body: file,
        signal,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Błąd uploadu");
    }

    const data = await res.json().catch(() => ({}));
    const url = data?.image?.downloadUrl ?? data?.image?.url ?? null;
    if (!url || typeof url !== "string") {
        throw new Error("Brak URL w odpowiedzi uploadu");
    }
    return url;
}
