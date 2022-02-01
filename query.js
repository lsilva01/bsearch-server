const AppSearchClient = require('@elastic/app-search-node')

const apiKey = process.env.API_KEY
const baseUrlFn = () => process.env.BASE_URL_FN
const client = new AppSearchClient(undefined, apiKey, baseUrlFn)

const engineName = process.env.ENGINE_NAME
const searchFields = { title : {}, body_content: {} }
const resultFields = { id: { raw: {} }, title: { raw: {} }, body_content: { raw: {} }, domains: { raw: {} }, url: { raw: {} } }
const options = { search_fields: searchFields, result_fields: resultFields, page: { size: 70 } }


async function search(query) {
    try {
        var response = await client.search(engineName, query, options)
        return handleResponse(response)
    } catch (error) {
        console.error(error);
    }
}

function handleResponse(response) {

    if (response.meta.page.size == 0) return []

    let result = []

    for(let doc of response.results) {
        var item = {};
        item.id = doc.id.raw;
        item.url = doc.url.raw;
        item.title = doc.title.raw;
        item.body_content = doc.body_content.raw;
        item.domain = doc.domains.raw[0];

        item.is_email_thread = item.domain === 'https://lists.linuxfoundation.org';

        // TODO: "[Lightning-dev] [bitcoin-dev] OP_CAT was Re: Continuing the discussion about noinput / anyprevout"
        // and "[bitcoin-dev] [Lightning-dev] OP_CAT was Re: Continuing the discussion about noinput / anyprevout"
        // should be considered same subject

        if (!item.is_email_thread || !result.find(o => o.title === item.title && o.domain === item.domain)) {
            result.push(item)
        }

        /*let same_thread_item = result.find(o => o.title === item.title && o.domain === item.domain);
        if (same_thread_item) {
            same_thread_item.same_thread.push(item)
        } else {
            result.push(item)
        }*/
    }

    return result
}

module.exports = {
    search
}
