import axios from "axios"
import { formatDate } from "utils"

const baseURL = subdomain => {
  if (process.env.NODE_ENV === "production") {
    return `https://${encodeURIComponent(subdomain)}.mocoapp.com/api/browser_extensions`
  } else {
    return `http://${encodeURIComponent(subdomain)}.mocoapp.localhost:3000/api/browser_extensions`
  }
}

export default class Client {
  #client
  #apiKey

  constructor({ subdomain, apiKey, version }) {
    this.#apiKey = apiKey
    this.#client = axios.create({
      responseType: "json",
      baseURL: baseURL(subdomain),
      headers: {
        common: {
          "x-api-key": apiKey,
          "x-extension-version": version,
        },
      },
    })
  }

  login = service =>
    this.#client.post("session", {
      api_key: this.#apiKey,
      remote_service: service?.name,
      remote_id: service?.id,
    })

  projects = () => this.#client.get("projects")

  schedules = (fromDate, toDate) =>
    this.#client.get("schedules", {
      params: { date: `${formatDate(fromDate)}:${formatDate(toDate)}` },
    })

  activities = (fromDate, toDate) =>
    this.#client.get("activities", {
      params: { date: `${formatDate(fromDate)}:${formatDate(toDate)}` },
    })

  activitiesStatus = service => {
    if (!service) {
      return Promise.resolve({ data: { hours: 0 } })
    }
    return this.#client.get("activities/status", {
      params: { remote_id: service.id, remote_service: service.name },
    })
  }

  createActivity = activity => this.#client.post("activities", { activity })

  stopTimer = timedActivity => this.#client.get(`activities/${timedActivity.id}/stop_timer`)
}
